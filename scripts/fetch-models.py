"""Restore the pinned model files, verifying content before replacing a file."""
import hashlib,json,pathlib,urllib.request
root=pathlib.Path(__file__).resolve().parents[1]/'public/models'
for asset in json.loads((root/'manifest.json').read_text()):
    path=root/pathlib.Path(asset['path']).name
    if path.exists() and hashlib.sha256(path.read_bytes()).hexdigest()==asset['sha256']:
        print(asset['id'], 'verified');continue
    data=urllib.request.urlopen(asset.get('download',asset['source']),timeout=45).read()
    if data[:4]!=b'glTF' or hashlib.sha256(data).hexdigest()!=asset['sha256']:
        raise ValueError('Downloaded content does not match pinned model: '+asset['id'])
    temporary=path.with_suffix('.tmp');temporary.write_bytes(data);temporary.replace(path)
    print(asset['id'], 'restored')
