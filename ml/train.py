"""Train the CNN and save ml/checkpoints/disaster_cnn.pt.

    python train.py
    python train.py --data ./data --epochs 12
"""

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import torch
from torch.utils.data import DataLoader

from dataset import FolderDisasterSet, SyntheticDisasterSet
from model import DISASTER_TYPES, SEVERITIES, DisasterCNN, multitask_loss

CHECKPOINT = Path(__file__).resolve().parent / "checkpoints" / "disaster_cnn.pt"


def run_epoch(model, loader, optimizer, device):
    training = optimizer is not None
    model.train(training)
    total_loss = 0.0
    disaster_correct = 0
    severity_correct = 0
    count = 0

    for images, disaster_y, severity_y in loader:
        images = images.to(device)
        disaster_y = disaster_y.to(device)
        severity_y = severity_y.to(device)

        with torch.set_grad_enabled(training):
            disaster_logits, severity_logits = model(images)
            loss = multitask_loss(disaster_logits, severity_logits, disaster_y, severity_y)
            if training:
                optimizer.zero_grad()
                loss.backward()
                optimizer.step()

        batch = images.size(0)
        total_loss += loss.item() * batch
        disaster_correct += (disaster_logits.argmax(dim=1) == disaster_y).sum().item()
        severity_correct += (severity_logits.argmax(dim=1) == severity_y).sum().item()
        count += batch

    return {
        "loss": total_loss / count,
        "disaster_acc": disaster_correct / count,
        "severity_acc": severity_correct / count,
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", type=str, default="", help="Folder of labeled photos. Empty uses the synthetic set.")
    parser.add_argument("--epochs", type=int, default=8)
    parser.add_argument("--batch-size", type=int, default=32)
    parser.add_argument("--lr", type=float, default=1e-3)
    args = parser.parse_args()

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    if args.data:
        train_set = FolderDisasterSet(args.data, train=True)
        test_set = FolderDisasterSet(args.data, train=False)
    else:
        train_set = SyntheticDisasterSet(n_per_pair=40, train=True, seed=1)
        test_set = SyntheticDisasterSet(n_per_pair=12, train=False, seed=99)

    train_loader = DataLoader(train_set, batch_size=args.batch_size, shuffle=True)
    test_loader = DataLoader(test_set, batch_size=args.batch_size)

    model = DisasterCNN().to(device)
    optimizer = torch.optim.Adam(model.parameters(), lr=args.lr)

    print(f"device={device} train={len(train_set)} test={len(test_set)}")
    for epoch in range(1, args.epochs + 1):
        train_metrics = run_epoch(model, train_loader, optimizer, device)
        test_metrics = run_epoch(model, test_loader, None, device)
        print(
            f"epoch {epoch:02d}  "
            f"train_loss={train_metrics['loss']:.3f}  "
            f"type_acc={train_metrics['disaster_acc']:.3f}  "
            f"severity_acc={train_metrics['severity_acc']:.3f}  "
            f"test_type_acc={test_metrics['disaster_acc']:.3f}  "
            f"test_severity_acc={test_metrics['severity_acc']:.3f}"
        )

    CHECKPOINT.parent.mkdir(parents=True, exist_ok=True)
    torch.save(
        {
            "state_dict": model.state_dict(),
            "disaster_types": DISASTER_TYPES,
            "severities": SEVERITIES,
            "image_size": 64,
        },
        CHECKPOINT,
    )
    print(f"saved {CHECKPOINT}")


if __name__ == "__main__":
    main()
