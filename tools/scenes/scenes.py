from draw import *

import math
def at(px,py,x,y,r,sc):
    a=math.radians(r); X=px*sc; Y=py*sc
    return (round(x+X*math.cos(a)-Y*math.sin(a),1), round(y+X*math.sin(a)+Y*math.cos(a),1))

def ground(y=300,col=None):
    return f'<rect x="0" y="{y}" width="{W}" height="{H-y}" fill="{col or C["ground"]}"/>'
def berm(x0=470,y=300):
    return f'<path d="M{x0},{y} Q{x0+60},{y-90} {W},{y-110} L{W},{y}Z" fill="{C["berm"]}"/>'

def s_finger():
    b=[ground(250,C['ground2']),berm(430,250),
       f'<rect x="0" y="292" width="{W}" height="108" fill="#8E7556"/><rect x="0" y="286" width="{W}" height="10" fill="#A3896A"/>']
    fist=(f'<path d="M-50,-4 Q-34,-12 -16,-6 Q-6,4 -10,18 Q-24,32 -44,26 Q-58,12 -50,-4Z" fill="{C["skin"]}" stroke="{C["skinD"]}" stroke-width="1.5"/>'
          f'<path d="M-46,10 Q-34,16 -20,12" fill="none" stroke="{C["skinD"]}" stroke-width="1.3"/><path d="M-44,19 Q-32,24 -20,20" fill="none" stroke="{C["skinD"]}" stroke-width="1.3"/>')
    finger=(f'<path d="M-14,4 Q0,4 6,12 Q10,20 5,24" fill="none" stroke="{C["skinD"]}" stroke-width="10" stroke-linecap="round"/>'
            f'<path d="M-14,4 Q0,4 6,12 Q10,20 5,24" fill="none" stroke="{C["skin"]}" stroke-width="7.5" stroke-linecap="round"/>')
    support=f'<ellipse cx="112" cy="14" rx="16" ry="10" fill="{C["skin"]}" stroke="{C["skinD"]}" stroke-width="1.5"/>'
    b.append(g(rifle(bolt_open=True)+fist+finger+support,300,205,-3,1.12))
    return svg(''.join(b),'Illustration: a shooter picks up a rifle on the range bench')

def s_pass_closed():
    b=[ground(310),berm(500,310)]
    rx,ry,rr,sc=335,195,-62,0.72
    wrist=at(-40,6,rx,ry,rr,sc); fore=at(70,6,rx,ry,rr,sc); grab=at(130,3,rx,ry,rr,sc)
    L=(215,310); R=(460,310)
    def loc(pt,o,flip=False): return ((o[0]-pt[0]) if flip else (pt[0]-o[0]), pt[1]-o[1])
    w=loc(wrist,L); f=loc(fore,L); gr=loc(grab,R,True)
    left=person(C['shirt1'],1,arms=[f'M8,-150 L{(8+w[0])/2},{(-150+w[1])/2+12} L{w[0]},{w[1]}',f'M10,-146 L{(10+f[0])/2},{(-146+f[1])/2+8} L{f[0]},{f[1]}'])
    right=person(C['shirt2'],-1,arms=[f'M8,-150 L{(8+gr[0])/2},{(-150+gr[1])/2+10} L{gr[0]},{gr[1]}'])
    b.append(g(left,*L)); b.append(g(right,*R))
    b.append(g(rifle(False),rx,ry,rr,sc))
    b.append(hand(*wrist,8)+hand(*fore,8)+hand(*grab,8))
    return svg(''.join(b),'Illustration: one shooter hands a rifle to another')

def s_sweep():
    # Top-down firing line. Three shooters at benches, middle one turned to talk with the muzzle on the neighbour.
    b=[f'<rect width="{W}" height="{H}" fill="{C["ground"]}"/>',
       f'<rect x="0" y="0" width="{W}" height="70" fill="{C["berm"]}"/>',
       f'<line x1="0" y1="250" x2="{W}" y2="250" stroke="{C["white"]}" stroke-width="4" stroke-dasharray="14 10"/>']
    for x in (150,320,490):
        b.append(f'<rect x="{x-60}" y="200" width="120" height="44" rx="6" fill="#8E7556"/>')
        b.append(f'<rect x="{x-40}" y="90" width="80" height="12" fill="{C["white"]}" stroke="{C["line"]}" stroke-width="1"/>' if True else '')
    def shooter(x,y,ang,shirt):
        body=(f'<ellipse cx="0" cy="0" rx="30" ry="18" fill="{shirt}"/><circle cx="0" cy="0" r="13" fill="{C["skin"]}"/>'
              f'<path d="M-6,-12 Q0,-18 6,-12" fill="{C["cap"]}"/>'
              f'<rect x="-4" y="-120" width="8" height="112" rx="3" fill="{C["metal"]}"/><rect x="-6" y="-30" width="12" height="40" rx="5" fill="{C["wood"]}"/>'
              f'<circle cx="10" cy="-26" r="6" fill="{C["skin"]}"/><circle cx="-6" cy="-60" r="6" fill="{C["skin"]}"/>')
        return g(body,x,y,ang)
    b.append(shooter(150,270,0,C['shirt1']))
    b.append(shooter(490,270,0,C['shirt1']))
    b.append(shooter(318,282,86,C['shirt2']))   # turned toward the right-hand neighbour
    b.append(f'<path d="M352,250 q14,-16 30,-6" fill="none" stroke="{C["line"]}" stroke-width="2"/><path d="M356,240 q10,-12 22,-4" fill="none" stroke="{C["line"]}" stroke-width="2"/>')  # talking marks
    return svg(''.join(b),'Illustration: three shooters on a firing line, seen from above')

def s_fence():
    b=[ground(320),berm(520,320)]
    for x in range(40,W,120):
        b.append(f'<rect x="{x}" y="180" width="10" height="145" fill="{C["post"]}"/>')
    for y in (205,240,275,305):
        b.append(f'<line x1="0" y1="{y}" x2="{W}" y2="{y-4}" stroke="{C["wire"]}" stroke-width="2"/>')
    climber=person(C['shirt1'],1,arms=['M8,-150 L30,-120 L52,-112','M8,-145 L34,-100 L74,-108'],legs='climb',muffs=False)
    b.append(g(climber,300,300,8))
    b.append(g(rifle(False),330,198,-18,0.6))
    b.append(hand(352,192)+hand(372,186))
    return svg(''.join(b),'Illustration: a hunter at a wire fence with a rifle')

def pistol(slide_back=True, mag_in=True):
    p=[]
    p.append(f'<path d="M-10,0 L60,0 L64,14 L40,16 L30,30 L4,30 Q-4,30 -6,22 L-10,0Z" fill="{C["metal"]}"/>')  # frame and trigger guard area
    p.append(f'<path d="M-14,8 L18,8 L10,92 Q8,100 -2,100 L-30,100 Q-40,100 -38,90 Z" fill="#2A2E33"/>')  # grip
    p.append(f'<path d="M30,16 Q30,36 14,36 Q2,36 2,22" fill="none" stroke="{C["metal"]}" stroke-width="3.5"/><path d="M14,14 Q18,22 14,28" stroke="{C["metal"]}" stroke-width="3" fill="none" stroke-linecap="round"/>')
    off=-26 if slide_back else 0
    p.append(f'<rect x="{-18+off}" y="-24" width="{120}" height="24" rx="3" fill="{C["metalL"]}"/>')  # slide
    if slide_back:
        p.append(f'<rect x="76" y="-20" width="26" height="14" rx="2" fill="{C["metal"]}"/>')  # exposed barrel
        p.append(f'<rect x="38" y="-22" width="34" height="20" fill="#15181B"/>')  # open ejection port
        if mag_in:
            p.append(f'<rect x="42" y="-10" width="22" height="8" rx="4" fill="{C["ammo"]}" stroke="{C["ammoD"]}" stroke-width="1"/>')  # cartridge at top of magazine
    for i in range(6): p.append(f'<line x1="{-12+off+i*6}" y1="-20" x2="{-12+off+i*6}" y2="-4" stroke="{C["metal"]}" stroke-width="1.5"/>')  # serrations
    if mag_in:
        p.append(f'<path d="M-32,98 L6,98 L6,110 L-34,110Z" fill="{C["metalL"]}"/>')  # magazine base plate in the grip
    return ''.join(p)

def s_pistol():
    b=[ground(250,C['ground2']),berm(430,250),
       f'<rect x="0" y="292" width="{W}" height="108" fill="#8E7556"/><rect x="0" y="286" width="{W}" height="10" fill="#A3896A"/>']
    gun=pistol(True,True)
    grip=(f'<path d="M-40,18 Q-24,10 -4,16 L-2,56 Q-16,66 -38,60 Q-46,38 -40,18Z" fill="{C["skin"]}" stroke="{C["skinD"]}" stroke-width="1.5"/>'
          + ''.join(f'<rect x="-6" y="{26+i*11}" width="14" height="9" rx="4.5" fill="{C["skin"]}" stroke="{C["skinD"]}" stroke-width="1.2"/>' for i in range(3))
          + f'<path d="M-4,12 L46,10" stroke="{C["skinD"]}" stroke-width="10" stroke-linecap="round"/><path d="M-4,12 L46,10" stroke="{C["skin"]}" stroke-width="7.5" stroke-linecap="round"/>')
    b.append(g(gun+grip,260,150,0,1.75))
    return svg(''.join(b),'Illustration: a shooter unloading a semi-automatic pistol at the range bench')

def s_display():
    b=[f'<rect width="{W}" height="{H}" fill="{C["wall"]}"/>',f'<rect x="0" y="340" width="{W}" height="60" fill="#B9A88E"/>',
       f'<rect x="120" y="110" width="12" height="40" rx="3" fill="{C["shelf"]}"/><rect x="500" y="110" width="12" height="40" rx="3" fill="{C["shelf"]}"/>',
       f'<rect x="90" y="250" width="460" height="14" rx="3" fill="{C["shelf"]}"/>']
    b.append(g(rifle(False)+
               f'<rect x="-2" y="8" width="20" height="22" rx="4" fill="{C["lock"]}"/><circle cx="8" cy="19" r="3" fill="{C["white"]}"/>',  # trigger lock fitted
               330,128,0,1.15))
    # box of cartridges on the shelf right under the rifle
    b.append(f'<rect x="270" y="212" width="92" height="38" rx="3" fill="#E4D9C2" stroke="{C["line"]}" stroke-width="1.5"/><rect x="276" y="200" width="80" height="14" fill="#E4D9C2" stroke="{C["line"]}" stroke-width="1.5"/>')
    for i in range(7): b.append(f'<rect x="{282+i*11}" y="186" width="7" height="22" rx="3" fill="{C["ammo"]}" stroke="{C["ammoD"]}" stroke-width="1"/>')
    b.append(f'<rect x="284" y="222" width="64" height="16" fill="{C["shirt2"]}" opacity=".85"/>')
    return svg(''.join(b),'Illustration: a rifle on a wall rack at home')

SCENES={'finger':s_finger,'pass-closed':s_pass_closed,'muzzle-sweep':s_sweep,'fence':s_fence,'pistol-unload':s_pistol,'wall-display':s_display}
if __name__=='__main__':
    # Writes each scene to content/drills/scenes/<id>.svg. Run: python3 tools/scenes/scenes.py
    import os
    out=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..','content','drills','scenes')
    os.makedirs(out,exist_ok=True)
    for k,f in SCENES.items(): open(os.path.join(out,f'{k}.svg'),'w').write(f()+'\n')
    print(f'Wrote {len(SCENES)} scenes to content/drills/scenes')
if False:
    sheet='<html><body style="margin:0;display:grid;grid-template-columns:1fr 1fr;gap:8px;background:#444">'+''.join(f'<div style="background:#fff"><div style="font:14px sans-serif;padding:4px">{k}</div>{open(f"out/{k}.svg").read()}</div>' for k in SCENES)+'</body></html>'
    open('sheet.html','w').write(sheet)
