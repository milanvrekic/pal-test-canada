# The six "what is wrong here" scenes. Each shows one mistake; everything else is done correctly.
# Run: python3 tools/scenes/scenes.py  (writes content/drills/scenes/<id>.svg). Drawing parts are in kit.py.
from kit import *

def outdoor(horizon=250, berm_x=400, target=True):
    p=[f'<rect width="{W}" height="{H}" fill="url(#sky)"/>']
    trees=''.join(f'<circle cx="{x}" cy="{horizon-6-((x*37)%11)}" r="{16+((x*13)%9)}" fill="#6F8A66"/>' for x in range(-10,W+20,22))
    p.append(trees+f'<rect x="0" y="{horizon-8}" width="{W}" height="12" fill="#6F8A66"/>')
    p.append(f'<rect x="0" y="{horizon}" width="{W}" height="{H-horizon}" fill="url(#grass)"/>')
    p.append(f'<path d="M{berm_x},{horizon+2} Q{berm_x+70},{horizon-80} {W},{horizon-96} L{W},{horizon+2} Z" fill="url(#bermG)"/>')
    if target:
        tx=berm_x+150; ty=horizon-34
        p.append(f'<rect x="{tx-2}" y="{ty}" width="4" height="34" fill="#6B5843"/><rect x="{tx+40}" y="{ty}" width="4" height="34" fill="#6B5843"/>'
                 f'<rect x="{tx-6}" y="{ty-30}" width="54" height="34" fill="#F2EEE4" stroke="#6B5843" stroke-width="1.5"/>'
                 f'<circle cx="{tx+21}" cy="{ty-13}" r="11" fill="none" stroke="#2B2F33" stroke-width="1.5"/><circle cx="{tx+21}" cy="{ty-13}" r="5" fill="#2B2F33"/>')
    return ''.join(p)

def bench(y=292):
    return (f'<rect x="0" y="{y}" width="{W}" height="{H-y}" fill="url(#bench)"/><rect x="0" y="{y-6}" width="{W}" height="10" rx="2" fill="#B89A72"/>'
            + ''.join(f'<path d="M{x},{y+18} Q{x+60},{y+14} {x+140},{y+20}" fill="none" stroke="#6A5238" stroke-width="1" opacity=".5"/>' for x in range(-20,W,160)))

def s_finger():
    b=[outdoor(250,380),bench(292),shadow(330,292,220,10)]
    gun=rifle(bolt_open=True)+rifle_grip_hand(True)+support_hand(108)
    b.append(g(gun,292,236,-2,1.26))
    return svg(''.join(b),'Illustration: a shooter picks up a rifle at the range bench')

def s_pass_closed():
    b=[outdoor(300,470)]
    rx,ry,rr,sc=334,206,-74,0.72
    grip=at(-45,22,rx,ry,rr,sc); low=at(40,10,rx,ry,rr,sc); high=at(120,8,rx,ry,rr,sc)
    L=(262,372); R=(418,372)
    loc=lambda pt,o,flip=False: ((o[0]-pt[0]) if flip else (pt[0]-o[0]), pt[1]-o[1])
    b.append(shadow(262,372,44,7)+shadow(418,372,44,7))
    b.append(g(person(hands=[loc(grip,L),loc(low,L)]),*L))
    b.append(g(rifle(bolt_open=False),rx,ry,rr,sc))
    b.append(g(person(jacket='#C9693D',hands=[(6,-104),loc(high,R,True)],mouth_open=True),*R,0,1,True))
    b.append(mitt(grip,6.5)+mitt(low,6.5)+mitt(high,6.5))
    return svg(''.join(b),'Illustration: one shooter hands a rifle to another')

def top_shooter(jacket):
    # Shooter seen from above, rifle pointing toward -y.
    rifle_top=('<path d="M-5,40 L5,40 L4,-4 L-4,-4 Z" fill="url(#wood)"/><rect x="-3.5" y="-60" width="7" height="58" rx="2" fill="#9A6538"/>'
               '<rect x="-3" y="-34" width="6" height="30" rx="2" fill="#2B3036"/><rect x="-4.5" y="-40" width="9" height="34" rx="3" fill="#1E2124" opacity=".9"/>'
               '<rect x="-1.6" y="-128" width="3.2" height="70" fill="#2B3036"/>')
    return (f'<ellipse cx="0" cy="46" rx="34" ry="20" fill="{jacket}" stroke="#00000030"/>'
            f'<path d="M-26,44 L-8,20 L-2,6" fill="none" stroke="{jacket}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>'
            f'<path d="M24,44 L8,28 L2,34" fill="none" stroke="{jacket}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>'
            + rifle_top +
            '<circle cx="-2" cy="6" r="5.5" fill="#DCA67E" stroke="#A9744C"/><circle cx="2" cy="34" r="5.5" fill="#DCA67E" stroke="#A9744C"/>'
            '<circle cx="0" cy="46" r="13" fill="#B5462F"/><path d="M-9,38 Q0,30 9,38 L6,42 L-6,42 Z" fill="#9E3B27"/>'
            '<rect x="-16" y="42" width="5" height="9" rx="2" fill="#2B3036"/><rect x="11" y="42" width="5" height="9" rx="2" fill="#2B3036"/>')

def s_sweep():
    b=[f'<rect width="{W}" height="{H}" fill="url(#grass)"/>',
       f'<rect x="0" y="0" width="{W}" height="70" fill="url(#bermG)"/><rect x="0" y="66" width="{W}" height="6" fill="#86704F"/>']
    for x in (130,320,510):
        b.append(f'<rect x="{x-26}" y="84" width="52" height="34" fill="#F2EEE4" stroke="#6B5843" stroke-width="1.5"/><circle cx="{x}" cy="101" r="9" fill="none" stroke="#2B2F33" stroke-width="1.4"/><circle cx="{x}" cy="101" r="3.5" fill="#2B2F33"/>')
        b.append(f'<rect x="{x-62}" y="214" width="124" height="44" rx="5" fill="url(#bench)" stroke="#5E4A33" stroke-width="1"/>')
    b.append(f'<line x1="0" y1="268" x2="{W}" y2="268" stroke="#F4F1E8" stroke-width="4" stroke-dasharray="16 10"/>')
    b.append(g(top_shooter('#3F5E4C'),130,262))
    b.append(g(top_shooter('#3F5E4C'),510,262))
    b.append(g(top_shooter('#C9693D'),330,286,88))   # turned to talk, muzzle on the right-hand neighbour
    b.append('<path d="M286,262 q-12,-14 -4,-28" fill="none" stroke="#2B2F33" stroke-width="2" stroke-linecap="round"/><path d="M276,266 q-16,-18 -6,-36" fill="none" stroke="#2B2F33" stroke-width="2" stroke-linecap="round"/>')
    return svg(''.join(b),'Illustration: three shooters on a firing line, seen from above')

def s_fence():
    b=[outdoor(300,500,False)]
    for x in range(30,W,130):
        b.append(f'<rect x="{x}" y="196" width="11" height="132" rx="2" fill="#7E6A52"/><line x1="{x+3}" y1="200" x2="{x+3}" y2="326" stroke="#6A5743" stroke-width="1"/>')
    for y in (214,248,282,312):
        b.append(f'<line x1="0" y1="{y}" x2="{W}" y2="{y-6}" stroke="#5C5A55" stroke-width="1.8"/>')
        b.append(''.join(f'<path d="M{x},{y-6*x/W-3} l4,6 M{x+4},{y-6*x/W-3} l-4,6" stroke="#5C5A55" stroke-width="1.2"/>' for x in range(18,W,46)))
    for x in range(10,W,34): b.append(f'<path d="M{x},332 q3,-10 6,0 q3,-12 6,0" fill="#6E8556"/>')
    rx,ry,rr,sc=352,214,-14,0.62
    wrist=at(-45,22,rx,ry,rr,sc); fore=at(80,8,rx,ry,rr,sc)
    o=(300,344)
    loc=lambda pt: (pt[0]-o[0], pt[1]-o[1])
    b.append(shadow(300,344,50,7))
    b.append(g(person(hips=(6,-112),lean=14,legs=[(-24,-6),(34,-60)],hands=[loc(wrist),loc(fore)],muffs=False),*o))
    b.append(g(rifle(bolt_open=False),rx,ry,rr,sc))
    b.append(mitt(wrist,6)+mitt(fore,6))
    return svg(''.join(b),'Illustration: a hunter on his own crosses a wire fence with a rifle')

def s_pistol():
    b=[outdoor(250,380),bench(300),shadow(300,300,170,9)]
    b.append(g(pistol(slide_back=True,mag_in=True)+pistol_grip_hand(),280,170,-2,1.55))
    return svg(''.join(b),'Illustration: a shooter unloading a semi-automatic pistol at the range bench')

def s_display():
    b=[f'<rect width="{W}" height="{H}" fill="url(#wall)"/>']
    b.append(''.join(f'<line x1="{x}" y1="0" x2="{x}" y2="344" stroke="#D3C6B2" stroke-width="1.2"/>' for x in range(40,W,80)))
    b.append(f'<rect x="0" y="340" width="{W}" height="60" fill="#A88E6E"/><rect x="0" y="336" width="{W}" height="8" fill="#8C7357"/>')
    for x in (120,500):
        b.append(f'<path d="M{x},96 L{x+16},96 L{x+16},140 Q{x+8},146 {x},140 Z" fill="#7A5A3C"/><rect x="{x-2}" y="132" width="20" height="6" rx="2" fill="#5E442C"/>')
    b.append(shadow(320,152,230,8))
    b.append(g(rifle(bolt_open=False,scope=True,trigger_lock=True),318,132,0,1.12))
    b.append(f'<rect x="104" y="262" width="432" height="14" rx="3" fill="#7A5A3C"/><rect x="104" y="274" width="432" height="4" fill="#5E442C"/>'
             f'<path d="M150,278 L150,304 L172,278 Z" fill="#5E442C"/><path d="M490,278 L490,304 L468,278 Z" fill="#5E442C"/>')
    # open box of cartridges on the shelf right under the rifle
    b.append(shadow(300,262,60,5)+'<rect x="252" y="214" width="96" height="48" rx="3" fill="#E7DCC6" stroke="#6E5F48" stroke-width="1.4"/>'
             '<rect x="260" y="228" width="80" height="20" fill="#3F5E4C"/><rect x="266" y="234" width="40" height="3" fill="#E7DCC6"/><rect x="266" y="240" width="26" height="3" fill="#E7DCC6"/>')
    for i in range(8):
        x=258+i*11
        b.append(f'<rect x="{x}" y="186" width="8" height="30" rx="2" fill="url(#brass)"/><path d="M{x},{187} Q{x+4},{174} {x+8},{187} Z" fill="url(#copper)"/>')
    return svg(''.join(b),'Illustration: a rifle displayed on a wall rack at home')

SCENES={'finger':s_finger,'pass-closed':s_pass_closed,'muzzle-sweep':s_sweep,'fence':s_fence,'pistol-unload':s_pistol,'wall-display':s_display}

if __name__=='__main__':
    import os,sys
    out=sys.argv[1] if len(sys.argv)>1 else os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..','content','drills','scenes')
    os.makedirs(out,exist_ok=True)
    for k,f in SCENES.items(): open(os.path.join(out,f'{k}.svg'),'w').write(f()+'\n')
    print(f'Wrote {len(SCENES)} scenes to {out}')
