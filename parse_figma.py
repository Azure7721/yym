# -*- coding: utf-8 -*-
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open(r'C:\Users\15046\.claude\projects\D--portfolio2\c877bfef-bf16-4dfe-ac1c-86e93c2b94ea\tool-results\call_6c70888206a147db9e94a8db.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

text = data[0]['text']
lines = text.split('\n')

# Find top-level frames under Page 1
# Look for pattern: id, name, type: FRAME at certain indent levels
for i, line in enumerate(lines):
    stripped = line.strip()
    if stripped.startswith('id:'):
        id_val = stripped.split('id:')[1].strip()
        name = ''
        ntype = ''
        for j in range(i+1, min(i+5, len(lines))):
            l = lines[j].strip()
            if l.startswith('name:'):
                name = l.split('name:')[1].strip()
            if l.startswith('type:'):
                ntype = l.split('type:')[1].strip()
        if ntype == 'FRAME' and name:
            print(f'id={id_val}  name={name}')
