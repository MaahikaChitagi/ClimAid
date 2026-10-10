# ClimAid

ClimAid is a platform that connects people affected by climate disasters with those ready to help. When someone is impacted by a disaster, such as flooding, wildfire, or a severe storm, ClimAid comes to their rescue by instantly linking them with helpers nearby. They can log in and create an issue report card with details on what happened, what’s needed, how many people are affected, the disaster type, and their location. Once submitted, the report appears on an interactive map for all users to see organized by category. Each dot on the map visual represents a report, and clicking it shows the details with an ‘Offer Help’ button.

Helpers can then fill out a form with what they can provide, how many people they can support, and where they can meet. The person in need instantly receives a notification with the helper’s info and distance to the meetup. They can review the offer and, if it’s a good match, they connect directly through an integrated chatbox. On the helper’s side, a new conversation thread appears under Connections, allowing both to coordinate the help quickly and personally.

ClimAid also features an ‘Explore’ page with real-time climate news and data trends, as well as ClimaBot, an AI assistant that gives personalized advice and guidance on climate crises.

## Disaster image CNN

Uploaded disaster photos are classified by a small PyTorch convolutional network in `ml/`. The network predicts disaster type (flood, wildfire, storm) and visible damage (low, moderate, severe). Those fields are saved on the Firebase report and shown on the map and report cards. Larger dots and a colored outline mark more severe damage.

The bundled checkpoint is trained on generated pattern images (water coverage, flame blobs, rain streaks) so the project runs without a large photo corpus. Replace that data with real labeled photos using the same folders and retrain:

```bash
python3 -m venv ml/.venv
ml/.venv/bin/pip install -r ml/requirements.txt
ml/.venv/bin/python ml/train.py
npm run classify-api
npm run dev
```

`train.py --data <folder>` expects photos in `<disaster>/<severity>/` folders (`flood/low`, `wildfire/moderate`, `storm/severe`, and the other seven combinations). The loss is the sum of two cross-entropy terms, one per head. The HTTP contract is in `ml/openapi.yaml`.
