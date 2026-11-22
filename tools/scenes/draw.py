# Generates the "what is wrong here" scenes as standalone SVG files.
# Each scene shows one handling mistake; everything else in it is done correctly.
W,H=640,400
C=dict(sky='#E7EEF1',ground='#C9D6BE',ground2='#B7C7A9',berm='#A88F6A',wood='#9C6B40',woodD='#7A5230',metal='#3A4047',metalL='#5A626B',
       skin='#D9A47C',skinD='#BF8960',shirt1='#2F6F73',shirt2='#C2693D',pants='#3D4A5C',cap='#B23A2E',wall='#EDE6DA',shelf='#8A6A48',
       ammo='#C8A43A',ammoD='#8C7220',line='#2B2F33',white='#FFFFFF',lock='#D23B2F',glass='#9FC3D6',post='#8C7A63',wire='#6D6A64')
def svg(body,label):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" role="img" aria-label="{label}"><rect width="{W}" height="{H}" fill="{C["sky"]}"/>{body}</svg>'
def g(inner,x=0,y=0,r=0,s=1,flip=False):
    sx=-s if flip else s
    return f'<g transform="translate({x} {y}) rotate({r}) scale({sx} {s})">{inner}</g>'

def rifle(bolt_open=False):
    # Bolt-action rifle, side view, muzzle toward +x, origin at the trigger.
    p=[]
    p.append(f'<path d="M-200,-14 L-70,-8 Q-45,-6 -38,-2 L-28,-2 L-28,10 Q-40,12 -52,22 L-200,44 Q-206,15 -200,-14Z" fill="{C["wood"]}"/>')  # butt stock
    p.append(f'<rect x="-206" y="-16" width="9" height="62" rx="3" fill="{C["woodD"]}"/>')  # butt pad
    p.append(f'<path d="M-30,-2 L150,-2 Q158,-2 158,4 L156,9 L60,10 L30,12 L-30,12Z" fill="{C["wood"]}"/>')  # fore-end
    p.append(f'<rect x="-28" y="-13" width="86" height="13" rx="2" fill="{C["metal"]}"/>')  # receiver
    p.append(f'<path d="M58,-12 L262,-9 L262,-3 L58,-1Z" fill="{C["metal"]}"/>')  # barrel
    p.append(f'<rect x="258" y="-12" width="4" height="4" fill="{C["metal"]}"/>')  # front sight
    p.append(f'<path d="M-6,12 Q-6,30 12,30 Q28,30 28,12" fill="none" stroke="{C["metal"]}" stroke-width="3.5"/>')  # trigger guard
    p.append(f'<path d="M9,12 Q12,19 8,25" fill="none" stroke="{C["metal"]}" stroke-width="3" stroke-linecap="round"/>')  # trigger
    if bolt_open:
        p.append(f'<rect x="2" y="-12" width="34" height="7" fill="#15181B"/>')  # open ejection port
        p.append(f'<rect x="-66" y="-12" width="40" height="8" rx="2" fill="{C["metalL"]}"/>')  # bolt drawn back
        p.append(f'<path d="M-44,-11 L-46,-30" stroke="{C["metalL"]}" stroke-width="4" stroke-linecap="round"/><circle cx="-46" cy="-32" r="5" fill="{C["metalL"]}"/>')
    else:
        p.append(f'<rect x="-34" y="-12" width="8" height="8" rx="2" fill="{C["metalL"]}"/>')  # bolt shroud
        p.append(f'<path d="M30,-4 L38,10" stroke="{C["metalL"]}" stroke-width="4" stroke-linecap="round"/><circle cx="39" cy="13" r="5" fill="{C["metalL"]}"/>')
    return ''.join(p)

def hand_on_wrist(finger_in_guard):
    # Right hand gripping the wrist of the stock; index finger either along the receiver or on the trigger.
    p=[f'<path d="M-46,-8 Q-30,-14 -14,-8 L-10,14 Q-26,26 -44,20 Q-52,6 -46,-8Z" fill="{C["skin"]}" stroke="{C["skinD"]}" stroke-width="1.5"/>']
    p.append(f'<path d="M-40,18 Q-28,30 -14,22" fill="none" stroke="{C["skinD"]}" stroke-width="1.5"/>')
    if finger_in_guard:
        p.append(f'<path d="M-12,6 Q2,8 6,14 Q8,20 4,22" fill="none" stroke="{C["skin"]}" stroke-width="7" stroke-linecap="round"/>')
        p.append(f'<path d="M-12,6 Q2,8 6,14 Q8,20 4,22" fill="none" stroke="{C["skinD"]}" stroke-width="1.2" stroke-linecap="round" opacity=".6"/>')
    else:
        p.append(f'<path d="M-12,-2 L30,-3" fill="none" stroke="{C["skin"]}" stroke-width="7" stroke-linecap="round"/>')
        p.append(f'<path d="M-12,-2 L30,-3" fill="none" stroke="{C["skinD"]}" stroke-width="1.2" stroke-linecap="round" opacity=".6"/>')
    return ''.join(p)

def person(shirt, facing=1, arms=None, legs='stand', cap=True, glasses=True, muffs=True):
    # Side-view figure, origin at the feet centre, about 200 units tall. facing 1 = right.
    p=[]
    if legs=='stand':
        p.append(f'<rect x="-14" y="-92" width="12" height="92" rx="6" fill="{C["pants"]}"/><rect x="2" y="-92" width="12" height="92" rx="6" fill="{C["pants"]}"/>')
        p.append(f'<rect x="-16" y="-6" width="18" height="8" rx="4" fill="{C["line"]}"/><rect x="0" y="-6" width="20" height="8" rx="4" fill="{C["line"]}"/>')
    elif legs=='climb':
        p.append(f'<path d="M-6,-90 L-24,-48 L-30,-10" stroke="{C["pants"]}" stroke-width="13" stroke-linecap="round" fill="none"/>')
        p.append(f'<path d="M6,-90 L30,-66 L40,-40" stroke="{C["pants"]}" stroke-width="13" stroke-linecap="round" fill="none"/>')
    p.append(f'<rect x="-20" y="-160" width="40" height="76" rx="14" fill="{shirt}"/>')
    p.append(f'<rect x="-6" y="-172" width="12" height="14" fill="{C["skin"]}"/>')
    p.append(f'<circle cx="0" cy="-186" r="17" fill="{C["skin"]}"/>')
    if cap: p.append(f'<path d="M-17,-190 Q-14,-206 2,-205 Q16,-204 17,-192 Z" fill="{C["cap"]}"/><rect x="8" y="-194" width="18" height="4" rx="2" fill="{C["cap"]}"/>')
    if muffs: p.append(f'<rect x="-6" y="-194" width="9" height="16" rx="4" fill="{C["line"]}"/>')
    if glasses: p.append(f'<rect x="8" y="-190" width="11" height="6" rx="2" fill="{C["glass"]}" stroke="{C["line"]}" stroke-width="1"/>')
    for a in (arms or []):
        p.append(f'<path d="{a}" stroke="{shirt}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"/>')
    body=''.join(p)
    return f'<g transform="scale({facing} 1)">{body}</g>'

def hand(x,y,r=7): return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{C["skin"]}" stroke="{C["skinD"]}" stroke-width="1.2"/>'
