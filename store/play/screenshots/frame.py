from PIL import Image, ImageDraw, ImageFont, ImageFilter
W,H=1080,1920
F='/home/claude/pal-test-canada/app/assets/fonts/Geist-ExtraBold.ttf'
items=[('1-quiz','Every answer explained,\nwith the handbook page'),
       ('2-home','Know what to\nstudy next'),
       ('2b-ready','Know when you’re ready\nfor the real test'),
       ('3-spot','Spot the handling\nmistake'),
       ('4-practical','Practise the\npractical test steps'),
       ('5-wait','Track your\nPAL application'),
       ('6-courses','Find a course\nin your province')]
def bg():
    g=Image.new('RGB',(W,H)); d=ImageDraw.Draw(g)
    a=(0x6A,0x5B,0xE8); b=(0x44,0x33,0xC2)
    for y in range(H):
        t=y/H; d.line([(0,y),(W,y)],fill=tuple(int(a[i]+(b[i]-a[i])*t) for i in range(3)))
    return g
font=ImageFont.truetype(F,78)
for i,(name,cap) in enumerate(items,1):
    c=bg(); d=ImageDraw.Draw(c)
    d.multiline_text((W//2,250),cap,font=font,fill='white',anchor='mm',align='center',spacing=14)
    sw,sh=810,1440; x=(W-sw)//2; y=440
    shot=Image.open(f'/tmp/shots/{name}.png').convert('RGB').resize((sw,sh),Image.LANCZOS)
    m=Image.new('L',(sw,sh),0); ImageDraw.Draw(m).rounded_rectangle((0,0,sw-1,sh-1),56,fill=255)
    shadow=Image.new('RGBA',(W,H),(0,0,0,0)); sd=ImageDraw.Draw(shadow)
    sd.rounded_rectangle((x,y+24,x+sw,y+sh+24),56,fill=(20,12,70,110)); shadow=shadow.filter(ImageFilter.GaussianBlur(28))
    c=Image.alpha_composite(c.convert('RGBA'),shadow).convert('RGB')
    c.paste(shot,(x,y),m)
    c.save(f'/home/claude/pal-test-canada/store/play/screenshots/{i:02d}-{name.split("-",1)[1]}.png',optimize=True)
print('ok')
