# Higher-detail drawing kit for the "what is wrong here" scenes.
# All parts are drawn in local coordinates and placed with g(). Gradients live in one shared <defs>.
import math
W,H=640,400

DEFS='''<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#BFD6E2"/><stop offset="1" stop-color="#EEF3F2"/></linearGradient>
<linearGradient id="grass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9DB27E"/><stop offset="1" stop-color="#7E9562"/></linearGradient>
<linearGradient id="bermG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B69A72"/><stop offset="1" stop-color="#957A55"/></linearGradient>
<linearGradient id="wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B98353"/><stop offset=".55" stop-color="#9A6538"/><stop offset="1" stop-color="#6E4623"/></linearGradient>
<linearGradient id="metal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6E767F"/><stop offset=".35" stop-color="#3E444B"/><stop offset="1" stop-color="#22262A"/></linearGradient>
<linearGradient id="steel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C9CED3"/><stop offset=".5" stop-color="#8A9198"/><stop offset="1" stop-color="#5C636A"/></linearGradient>
<linearGradient id="polymer" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#45494E"/><stop offset="1" stop-color="#1E2124"/></linearGradient>
<linearGradient id="skin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E6B48E"/><stop offset="1" stop-color="#C98E63"/></linearGradient>
<linearGradient id="brass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F0D27A"/><stop offset=".5" stop-color="#C9A13E"/><stop offset="1" stop-color="#8E6F22"/></linearGradient>
<linearGradient id="copper" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E3A07A"/><stop offset="1" stop-color="#A55A33"/></linearGradient>
<linearGradient id="bench" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A88A64"/><stop offset="1" stop-color="#7C6244"/></linearGradient>
<linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EFE7DA"/><stop offset="1" stop-color="#E0D5C4"/></linearGradient>
<radialGradient id="shadow"><stop offset="0" stop-color="#000" stop-opacity=".28"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
</defs>'''

def svg(body,label):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" role="img" aria-label="{label}">{DEFS}{body}</svg>'
def g(inner,x=0,y=0,r=0,s=1,flip=False):
    return f'<g transform="translate({x} {y}) rotate({r}) scale({-s if flip else s} {s})">{inner}</g>'
def at(px,py,x,y,r,sc):
    a=math.radians(r); X=px*sc; Y=py*sc
    return (x+X*math.cos(a)-Y*math.sin(a), y+X*math.sin(a)+Y*math.cos(a))
def shadow(cx,cy,rx,ry): return f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="url(#shadow)"/>'

# ---------- rifle: scoped bolt-action sporter, muzzle toward +x, origin at the trigger ----------
def rifle(bolt_open=False, scope=True, trigger_lock=False):
    p=[]
    # stock
    p.append('<path d="M-205,-22 L-98,-15 Q-74,-13 -60,-6 Q-47,-1 -32,-2 L150,-2 Q163,-1 163,5 Q162,11 152,12 L44,14 L-6,14 '
             'Q-20,14 -26,20 Q-32,28 -35,37 Q-37,43 -47,43 L-60,43 Q-66,41 -64,34 Q-66,26 -84,22 L-205,44 Z" fill="url(#wood)" stroke="#5A391C" stroke-width="1"/>')
    # grain and checkering
    p.append('<path d="M-196,-6 Q-150,-4 -110,2 M-190,12 Q-150,12 -96,10 M-186,28 Q-150,26 -110,22 M40,4 Q90,4 140,3" fill="none" stroke="#6E4623" stroke-width=".8" opacity=".45"/>')
    p.append('<path d="M-56,8 L-40,30 M-50,6 L-34,28 M-44,6 L-30,24 M-58,22 L-42,6 M-54,30 L-36,8 M-48,34 L-32,14" stroke="#5A391C" stroke-width=".6" opacity=".5"/>')
    p.append('<path d="M60,6 L100,6 M60,9 L100,9" stroke="#5A391C" stroke-width=".6" opacity=".45"/>')
    # recoil pad and sling studs
    p.append('<path d="M-214,-24 L-204,-23 L-204,45 L-214,47 Q-218,12 -214,-24Z" fill="#1E1F21"/>')
    p.append('<rect x="-152" y="31" width="6" height="7" rx="1.5" fill="url(#steel)"/><rect x="128" y="11" width="6" height="7" rx="1.5" fill="url(#steel)"/>')
    # receiver and barrel
    p.append('<rect x="-34" y="-15" width="98" height="15" rx="3" fill="url(#metal)"/>')
    p.append('<path d="M64,-13 L262,-9.5 L262,-3 L64,-1.5 Z" fill="url(#metal)"/><rect x="260" y="-10.5" width="4" height="8" rx="1" fill="#1A1D20"/>')
    p.append('<line x1="66" y1="-11" x2="258" y2="-8.5" stroke="#9AA3AC" stroke-width=".8" opacity=".6"/>')
    # trigger guard and trigger
    p.append('<path d="M-8,14 Q-10,32 8,33 Q28,33 30,14" fill="none" stroke="url(#metal)" stroke-width="4"/>')
    p.append('<path d="M9,14 Q14,21 9,28" fill="none" stroke="#2A2E32" stroke-width="3.2" stroke-linecap="round"/>')
    if bolt_open:
        p.append('<rect x="6" y="-14" width="36" height="8" rx="1" fill="#0E1012"/>')  # open ejection port
        p.append('<rect x="-84" y="-13.5" width="52" height="9" rx="4" fill="url(#steel)"/>')  # bolt body drawn back
        p.append('<path d="M-54,-12 L-58,-34" stroke="url(#steel)" stroke-width="4.5" stroke-linecap="round"/><circle cx="-59" cy="-37" r="6" fill="url(#steel)" stroke="#5C636A" stroke-width=".8"/>')
    else:
        p.append('<rect x="6" y="-14" width="36" height="8" rx="1" fill="url(#steel)"/>')  # bolt visible in closed port
        p.append('<rect x="-44" y="-13" width="12" height="11" rx="4" fill="url(#metal)"/>')  # bolt shroud
        p.append('<path d="M36,-7 L44,9" stroke="url(#steel)" stroke-width="4.5" stroke-linecap="round"/><circle cx="45" cy="12" r="6" fill="url(#steel)" stroke="#5C636A" stroke-width=".8"/>')
    if scope:
        p.append('<rect x="-6" y="-24" width="8" height="10" rx="1.5" fill="url(#metal)"/><rect x="48" y="-24" width="8" height="10" rx="1.5" fill="url(#metal)"/>')  # mounts
        p.append('<path d="M-30,-37 L-12,-33 L68,-33 L92,-40 L92,-18 L68,-25 L-12,-25 L-30,-21 Z" fill="url(#polymer)"/>')  # tube, bells
        p.append('<rect x="-34" y="-38" width="6" height="18" rx="2" fill="#16181B"/><rect x="90" y="-41" width="5" height="24" rx="2" fill="#16181B"/>')
        p.append('<rect x="22" y="-42" width="10" height="9" rx="2" fill="url(#polymer)"/>')  # turret
        p.append('<line x1="-12" y1="-31" x2="68" y2="-31" stroke="#8A929A" stroke-width=".8" opacity=".6"/>')
    if trigger_lock:
        p.append('<rect x="-4" y="10" width="30" height="30" rx="6" fill="#C8352B" stroke="#8C1F18" stroke-width="1.2"/><circle cx="11" cy="25" r="4" fill="#E9E2D6"/><rect x="10" y="25" width="2" height="5" fill="#8C1F18"/>')
    return ''.join(p)

# ---------- hands ----------
SK='url(#skin)'; SKD='#A9744C'
def finger(d,w=9):
    return f'<path d="{d}" fill="none" stroke="{SKD}" stroke-width="{w+2.2}" stroke-linecap="round" stroke-linejoin="round"/><path d="{d}" fill="none" stroke="#DCA67E" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round"/>'

def sleeve(d,col):
    return f'<path d="{d}" fill="{col}" stroke="#00000033" stroke-width="1"/>'

def rifle_grip_hand(finger_in_guard, sleeve_col='#3F5E4C'):
    # Right hand on the pistol grip, seen from the rifle's right side: back of the hand, thumb over the wrist,
    # three fingers curled round the front of the grip, index finger along the side or on the trigger.
    p=[sleeve('M-60,30 Q-80,36 -120,66 Q-128,74 -120,84 L-104,92 Q-80,70 -50,44 Z',sleeve_col),
       '<path d="M-60,32 Q-56,40 -52,44" fill="none" stroke="#00000040" stroke-width="2"/>',
       f'<path d="M-66,8 Q-54,-2 -38,0 Q-27,3 -25,14 L-28,32 Q-35,44 -50,44 Q-64,42 -68,30 Z" fill="{SK}" stroke="{SKD}" stroke-width="1.1"/>']
    p.append(finger('M-60,2 Q-48,-7 -34,-6',7.5))  # thumb over the top of the wrist
    for y in (20,28,36):
        p.append(finger(f'M-34,{y-3} Q-23,{y-3} -24,{y+3}',7))  # fingers round the front of the grip
    if finger_in_guard:
        p.append(finger('M-28,10 Q-8,9 3,15 Q9,20 6,25',7.5))
    else:
        p.append(finger('M-28,5 Q-2,4 20,3',7.5))
        p.append('<path d="M15,1.5 Q20,2 21,4.5" fill="none" stroke="#F3D3BA" stroke-width="1.2" opacity=".7"/>')
    return ''.join(p)

def support_hand(x, sleeve_col='#3F5E4C'):
    # Left hand cradling the fore-end from below, fingers curled up the near side.
    return (sleeve(f'M{x-8},22 Q{x-30},40 {x-50},80 L{x-28},90 Q{x-8},54 {x+12},30 Z',sleeve_col)
            + f'<path d="M{x-12},14 Q{x-2},8 {x+12},9 Q{x+20},12 {x+17},23 Q{x+6},29 {x-8},25 Z" fill="{SK}" stroke="{SKD}" stroke-width="1.1"/>'
            + finger(f'M{x-4},13 Q{x-1},4 {x+4},1',6.5) + finger(f'M{x+4},13 Q{x+7},4 {x+11},2',6.5) + finger(f'M{x+11},14 Q{x+15},7 {x+18},6',6))

# ---------- pistol: polymer-framed semi-automatic, muzzle toward +x, origin at the trigger ----------
def pistol(slide_back=True, mag_in=True):
    p=[]
    off=-24 if slide_back else 0
    # frame, dust cover, grip
    p.append('<path d="M-46,-2 L70,-2 L72,12 L34,14 L28,18 L-8,18 L-12,14 L-30,14 Z" fill="url(#polymer)"/>')
    p.append('<path d="M-46,-2 L-24,-2 L-18,10 L-6,86 Q-6,96 -16,98 L-46,100 Q-58,100 -60,90 L-66,18 Q-66,4 -46,-2 Z" fill="url(#polymer)"/>')
    for i in range(6):
        for j in range(3): p.append(f'<circle cx="{-50+j*10+i*1.2}" cy="{30+i*10}" r="1.3" fill="#5A5F65" opacity=".7"/>')  # grip texture
    p.append('<path d="M-6,18 Q-8,34 8,35 L28,35 Q34,34 32,18" fill="none" stroke="url(#polymer)" stroke-width="5"/>')
    p.append('<path d="M10,14 Q15,21 11,28" fill="none" stroke="#111" stroke-width="3.4" stroke-linecap="round"/>')
    p.append('<rect x="-10" y="4" width="22" height="4" rx="2" fill="#5C636A"/>')  # slide stop lever
    if slide_back:
        p.append('<rect x="58" y="-21" width="44" height="16" rx="2" fill="url(#steel)"/><rect x="100" y="-19" width="4" height="12" rx="1" fill="#2A2E32"/>')  # exposed barrel
    # slide
    p.append(f'<path d="M{-52+off},-28 L{96+off},-28 Q{104+off},-28 {104+off},-20 L{104+off},-2 L{-52+off},-2 Z" fill="url(#metal)"/>')
    for i in range(7): p.append(f'<line x1="{-46+off+i*5}" y1="-25" x2="{-46+off+i*5}" y2="-5" stroke="#1A1D20" stroke-width="1.6"/>')
    p.append(f'<rect x="{-48+off}" y="-33" width="8" height="5" rx="1" fill="#1A1D20"/><rect x="{94+off}" y="-32" width="5" height="4" rx="1" fill="#1A1D20"/>')  # sights
    p.append(f'<line x1="{-50+off}" y1="-26" x2="{102+off}" y2="-26" stroke="#8A939C" stroke-width=".8" opacity=".6"/>')
    if slide_back:
        p.append('<rect x="22" y="-26" width="34" height="22" rx="2" fill="#0B0C0E"/>')  # open port showing the magazine below
        if mag_in:
            p.append('<rect x="26" y="-12" width="26" height="9" rx="4.5" fill="url(#brass)"/><path d="M48,-12 Q58,-7.5 48,-3 Z" fill="url(#copper)"/>')  # next cartridge
            p.append('<rect x="24" y="-4" width="30" height="3" fill="#30343A"/>')  # magazine lips
    else:
        p.append(f'<rect x="{22+off}" y="-24" width="30" height="14" rx="1" fill="url(#metal)" stroke="#1A1D20" stroke-width=".8"/>')
    if mag_in:
        p.append('<path d="M-50,100 L-8,98 L-6,108 L-52,110 Z" fill="url(#steel)"/>')  # base plate
    return ''.join(p)

def pistol_grip_hand(sleeve='#3F5E4C'):
    # Right hand on the pistol grip, index finger straight along the frame above the trigger guard.
    p=[f'<path d="M-110,120 L-66,50 L-40,64 L-74,140 Z" fill="{sleeve}"/>',
       f'<path d="M-70,6 Q-58,-6 -40,-4 Q-26,0 -16,14 L-10,62 Q-22,78 -44,76 Q-64,72 -70,50 Z" fill="{SK}" stroke="{SKD}" stroke-width="1.2"/>']
    p.append(finger('M-56,2 Q-38,-6 -22,0',9))  # thumb high on the frame
    for y in (32,46,60):
        p.append(finger(f'M-30,{y-6} Q-12,{y-6} -8,{y}',9))
    p.append(finger('M-18,10 Q14,8 40,7',9))  # index straight along the frame
    return ''.join(p)

# ---------- people: side view built from joints, facing +x, origin between the feet ----------
def ik(s,t,l1,l2,bend=1):
    # Two-bone IK: returns the elbow/knee point between s and t. bend picks which side the joint goes.
    dx,dy=t[0]-s[0],t[1]-s[1]; d=max(1e-6,math.hypot(dx,dy)); d2=min(d,l1+l2-0.01)
    a=math.acos(max(-1,min(1,(l1*l1+d2*d2-l2*l2)/(2*l1*d2))))
    base=math.atan2(dy,dx)+bend*a
    return (s[0]+l1*math.cos(base), s[1]+l1*math.sin(base))
def limb(a,b,c,w,col,edge='#00000030'):
    d=f'M{a[0]:.1f},{a[1]:.1f} L{b[0]:.1f},{b[1]:.1f} L{c[0]:.1f},{c[1]:.1f}'
    return f'<path d="{d}" fill="none" stroke="{edge}" stroke-width="{w+2}" stroke-linecap="round" stroke-linejoin="round"/><path d="{d}" fill="none" stroke="{col}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round"/>'
def boot(ank,ang=0):
    return g('<path d="M-9,-6 L8,-6 Q20,-5 22,4 L-10,4 Z" fill="#3A2B20"/><rect x="-11" y="3" width="34" height="4" rx="2" fill="#1E1712"/>',ank[0],ank[1],ang)
def mitt(pt,r=6.5):
    return f'<circle cx="{pt[0]:.1f}" cy="{pt[1]:.1f}" r="{r}" fill="{SK}" stroke="{SKD}" stroke-width="1.1"/>'

def person(jacket='#3F5E4C', pants='#4A5566', hips=(0,-102), lean=0, legs=None, hands=None, cap='#B5462F', glasses=True, muffs=True, mouth_open=False):
    """legs: [(ankle_back),(ankle_front)]; hands: [(wrist_back),(wrist_front)] in local coords. lean tilts the torso in degrees."""
    legs=legs or [(-8,-6),(8,-6)]
    hip=hips
    t=math.radians(lean)
    def up(dx,dy): return (hip[0]+dx*math.cos(t)-dy*math.sin(t), hip[1]+dx*math.sin(t)+dy*math.cos(t))
    sh=up(4,-66); neck=up(7,-76); head=up(12,-96)
    hands=hands or [(sh[0]-4,sh[1]+70),(sh[0]+6,sh[1]+70)]
    p=[]
    kb=ik(hip,legs[0],49,49,-1); kf=ik(hip,legs[1],49,49,-1)
    eb=ik(sh,hands[0],38,36,1); ef=ik(sh,hands[1],38,36,1)
    # back limbs (darker)
    p.append(limb(hip,kb,legs[0],17,'#3D4756')); p.append(boot(legs[0]))
    p.append(limb(sh,eb,hands[0],13,'#334C3E' if jacket=='#3F5E4C' else '#A55530')); p.append(mitt(hands[0]))
    # torso
    p.append(g(f'<path d="M-16,-70 Q-4,-80 14,-72 Q22,-50 20,-6 Q8,4 -14,2 Q-22,-34 -16,-70 Z" fill="{jacket}" stroke="#00000030" stroke-width="1"/>'
               f'<path d="M2,-66 L4,-4" stroke="#00000025" stroke-width="1.5"/><rect x="-16" y="-8" width="36" height="8" rx="3" fill="#2A2F36"/>',hip[0],hip[1],lean))
    # front leg
    p.append(limb(hip,kf,legs[1],17,pants)); p.append(boot(legs[1]))
    # head
    hx,hy=head
    hd=(f'<rect x="-6" y="10" width="11" height="12" fill="#C98E63"/>'
        f'<path d="M-14,-4 Q-15,-18 0,-19 Q15,-19 16,-4 L17,2 L21,5 Q19,8 16,8 Q14,17 4,19 Q-10,19 -14,8 Z" fill="{SK}" stroke="{SKD}" stroke-width="1.1"/>'
        f'<path d="M-15,-6 Q-16,-12 -12,-14 L-12,2 Z" fill="#5A3B26"/>'
        f'<path d="M-16,-6 Q-14,-22 2,-22 Q16,-22 17,-8 Z" fill="{cap}"/><path d="M14,-9 L28,-7 Q28,-4 14,-5 Z" fill="{cap}"/>'
        f'<circle cx="10" cy="-1" r="1.6" fill="#2A1E16"/>'
        f'<path d="M9,{11 if mouth_open else 12} Q12,{13 if mouth_open else 12} 14,{11 if mouth_open else 12}" fill="{"#7A3B2A" if mouth_open else "none"}" stroke="#7A4B33" stroke-width="1.2"/>')
    if glasses: hd+='<path d="M5,-4 L18,-4 L17,2 L6,2 Z" fill="#9FC7DC" fill-opacity=".7" stroke="#1F2326" stroke-width="1.1"/><line x1="-4" y1="-3" x2="5" y2="-3" stroke="#1F2326" stroke-width="1.1"/>'
    if muffs: hd+='<path d="M-10,-6 Q-6,-26 2,-24" fill="none" stroke="#1F2326" stroke-width="3"/><rect x="-10" y="-9" width="10" height="15" rx="4" fill="#2B3036"/>'
    p.append(g(hd,hx,hy,lean*0.5))
    # front arm
    p.append(limb(sh,ef,hands[1],13,jacket)); p.append(mitt(hands[1]))
    return ''.join(p)
