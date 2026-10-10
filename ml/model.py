"""CNN that predicts disaster type and damage severity from one photo."""

import torch
import torch.nn as nn
import torch.nn.functional as F

IMAGE_SIZE = 64
DISASTER_TYPES = ("flood", "wildfire", "storm")
SEVERITIES = ("low", "moderate", "severe")
MODEL_NAME = "disaster-cnn-v1"


class ConvBlock(nn.Module):
"""Conv, then ReLU, then max pool. Each block halves the image size."""

    def __init__(self, in_channels, out_channels):
        super().__init__()
        self.conv = nn.Conv2d(in_channels, out_channels, kernel_size=3, padding=1, bias=False)
        self.norm = nn.BatchNorm2d(out_channels)
        self.pool = nn.MaxPool2d(kernel_size=2)

    def forward(self, x):
        return self.pool(F.relu(self.norm(self.conv(x))))


class DisasterCNN(nn.Module):
"""Shared conv features, then one head for type and one for severity."""

    def __init__(self):
        super().__init__()
        self.features = nn.Sequential(
            ConvBlock(3, 16),
            ConvBlock(16, 32),
            ConvBlock(32, 64),
        )
        self.shared = nn.Sequential(
            nn.Flatten(),
            nn.Linear(64 * 8 * 8, 128),
            nn.ReLU(),
            nn.Dropout(0.3),
        )
        self.disaster_head = nn.Linear(128, len(DISASTER_TYPES))
        self.severity_head = nn.Linear(128, len(SEVERITIES))

    def forward(self, x):
        hidden = self.shared(self.features(x))
        return self.disaster_head(hidden), self.severity_head(hidden)

    def predict_proba(self, x):
"""Turn raw scores into probabilities that add up to 1."""
        disaster_logits, severity_logits = self.forward(x)
        return F.softmax(disaster_logits, dim=1), F.softmax(severity_logits, dim=1)


def multitask_loss(disaster_logits, severity_logits, disaster_y, severity_y):
"""Add the type loss and the severity loss so both heads train together."""
    return F.cross_entropy(disaster_logits, disaster_y) + F.cross_entropy(severity_logits, severity_y)


def load_model(checkpoint_path, device):
    checkpoint = torch.load(checkpoint_path, map_location=device, weights_only=False)
    model = DisasterCNN()
    model.load_state_dict(checkpoint["state_dict"])
    model.to(device)
    model.eval()
    return model, checkpoint
