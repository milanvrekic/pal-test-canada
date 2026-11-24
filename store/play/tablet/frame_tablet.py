# Landscape 16:9 tablet store art: big type on the left, a tablet with a phone in front of it on the right.
import sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont
FONTS='/home/claude/pal-test-canada/app/assets/fonts/'
OUT='/home/claude/pal-test-canada/store/play/tablet/'
SH='/tmp/shots/'
SCENES=[
  ('quiz','t-quiz','3-spot','Every answer\nexplained.','162 CFSC and CRFSC questions, each one\ncited to the handbook page and checked\nby a certified instructor.'),
  ('ready','t-home','1-quiz','Know when\nyou’re ready.','Practice exams, weakest topics first,\nand a readiness score that tells you\nwhen to book the real test.'),
  ('hands-on','t-spot','p-practical','Practise the\nhands-on test.','Spot the mistake in real field scenes,\nthen drill PROVE and safe handling\nstep by step.'),
  ('licence','t-wait','p-courses','From course day\nto licence.','Course providers by province, the\napplication checklist and a tracker\nfor your PAL wait.'),
]
def grad(W,H,s):
    a=(0x6E,0x5F,0xEC); b=(0x37,0x28,0xA8)
    g=Image.new('RGB',(W,H)); px=g.load()
    for y in range(H):
        for x in range(0,W,4):
            t=min(1,max(0,(x/W)*0.45+(y/H)*0.55))
            c=tuple(int(a[i]+(b[i]-a[i])*t) for i in range(3))
            for k in range(4):
                if x+k<W: px[x+k,y]=c
    glow=Image.new('L',(W,H),0); ImageDraw.Draw(glow).ellipse((int(1000*s),int(-100*s),int(2100*s),int(1000*s)),fill=90)
    glow=glow.filter(ImageFilter.GaussianBlur(int(160*s)))
    return Image.composite(Image.new('RGB',(W,H),(178,168,255)),g,glow)
def device(img,w,h,bez,rad,s):
    # bezel + rounded screen
    W,H=w+2*bez,h+2*bez
    d=Image.new('RGBA',(W,H),(0,0,0,0)); dr=ImageDraw.Draw(d)
    dr.rounded_rectangle((0,0,W-1,H-1),rad,fill=(14,15,22,255))
    dr.rounded_rectangle((int(2*s),int(2*s),W-1-int(2*s),H-1-int(2*s)),rad-int(2*s),outline=(60,62,78,255),width=max(1,int(2*s)))
    scr=img.convert('RGB').resize((w,h),Image.LANCZOS)
    m=Image.new('L',(w,h),0); ImageDraw.Draw(m).rounded_rectangle((0,0,w-1,h-1),max(4,rad-bez),fill=255)
    d.paste(scr,(bez,bez),m)
    return d
def shadow(canvas,box,rad,s,alpha=120,blur=40,dy=30):
    sh=Image.new('RGBA',canvas.size,(0,0,0,0))
    ImageDraw.Draw(sh).rounded_rectangle((box[0],box[1]+int(dy*s),box[2],box[3]+int(dy*s)),rad,fill=(16,8,60,alpha))
    return Image.alpha_composite(canvas,sh.filter(ImageFilter.GaussianBlur(int(blur*s))))
def render(scene,s,name):
    key,tab,ph,head,sub=scene
    W,H=int(1920*s),int(1080*s)
    c=grad(W,H,s).convert('RGBA')
    # tablet, bleeding off the bottom
    tw,th=int(620*s),int(992*s); tb=int(22*s); tr=int(56*s)
    tx,ty=int(1190*s),int(130*s)
    tdev=device(Image.open(SH+tab+'.png'),tw,th,tb,tr,s)
    c=shadow(c,(tx,ty,tx+tdev.width,ty+tdev.height),tr,s)
    c.alpha_composite(tdev,(tx,ty))
    # phone in front, overlapping the tablet's left edge
    pw,phh=int(300*s),int(533*s); pb=int(12*s); pr=int(48*s)
    px,py=int(866*s),int(400*s)
    pdev=device(Image.open(SH+ph+'.png'),pw,phh,pb,pr,s)
    c=shadow(c,(px,py,px+pdev.width,py+pdev.height),pr,s,alpha=150,blur=34,dy=26)
    c.alpha_composite(pdev,(px,py))
    d=ImageDraw.Draw(c)
    # brand row
    bx,by=int(120*s),int(150*s); isz=int(64*s)
    icon=Image.open('/home/claude/pal-test-canada/store/icon/app-store-1024.png').convert('RGB').resize((isz,isz),Image.LANCZOS)
    m=Image.new('L',(isz,isz),0); ImageDraw.Draw(m).rounded_rectangle((0,0,isz-1,isz-1),int(15*s),fill=255)
    c.paste(icon,(bx,by),m)
    d.text((bx+isz+int(20*s),by+isz//2),'PAL TEST CANADA',font=ImageFont.truetype(FONTS+'Khand-Bold.ttf',int(42*s)),fill='white',anchor='lm')
    # headline and sub
    hf=ImageFont.truetype(FONTS+'Geist-ExtraBold.ttf',int(84*s))
    d.multiline_text((bx,int(300*s)),head,font=hf,fill='white',spacing=int(8*s))
    sf=ImageFont.truetype(FONTS+'Geist-SemiBold.ttf',int(32*s))
    d.multiline_text((bx,int(540*s)),sub,font=sf,fill=(236,233,255),spacing=int(14*s))
    # footnote chip
    ff=ImageFont.truetype(FONTS+'Geist-SemiBold.ttf',int(24*s))
    t='Free · No account · Not affiliated with the RCMP'
    tw2=d.textlength(t,font=ff); cx,cy=bx,int(880*s)
    ov=Image.new('RGBA',c.size,(0,0,0,0))
    ImageDraw.Draw(ov).rounded_rectangle((cx,cy,cx+tw2+int(48*s),cy+int(54*s)),int(27*s),fill=(255,255,255,46))
    c.alpha_composite(ov); d=ImageDraw.Draw(c)
    d.text((cx+int(24*s),cy+int(27*s)),t,font=ff,fill='white',anchor='lm')
    c.convert('RGB').save(OUT+name,optimize=True)
for i,sc in enumerate(SCENES,1):
    render(sc,1,f'7in-{i:02d}-{sc[0]}-1920x1080.png')
    render(sc,4/3,f'10in-{i:02d}-{sc[0]}-2560x1440.png')
print('done')
