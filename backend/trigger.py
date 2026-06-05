import requests

url = "http://127.0.0.1:8000/api/scans/"
files = {'image': open(r'D:\Brand Guard\backend\media\scans\2026\06\download_1_ciNfRYf.jpg', 'rb')}
data = {'brand': 1, 'source': 'manual'}
response = requests.post(url, files=files, data=data)
print("Status:", response.status_code)
print("Response:", response.json())
