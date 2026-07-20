from PIL import Image
import json, math, sys

W, H, OX, OY = 180, 140, 90, 112
frames = json.load(open('public/assets/unitmc-timeline.json', encoding='utf-8'))['frames']
frame_number = int(sys.argv[1]) if len(sys.argv) > 1 else 1
parts = {name: values for name, *values in frames[frame_number - 1]}
assets = {
    # The decoded UnitMC arm symbols are complete composite canvases.  The
    # tight PNGs only contained isolated raster fragments and therefore could
    # not preserve the authored hand/gun assembly.
    'arm1': ('private-assets/extracted/sprites/DefineSprite_501_MBFZ_fla.arm_gun_316/51.png', -92.13406066894532, -105.37676849365235, 1),
    'foot2': ('public/assets/unit-parts/tight/foot.png', 1.5, 0, None),
    'leglow2': ('public/assets/unit-parts/tight/leg_lower.png', -9.45, -3.3, None),
    'legup2': ('public/assets/unit-parts/tight/leg_upper.png', -5.5, -2.95, None),
    'foot1': ('public/assets/unit-parts/tight/foot.png', 1.5, 0, None),
    'leglow1': ('public/assets/unit-parts/tight/leg_lower.png', -9.45, -3.3, None),
    'legup1': ('public/assets/unit-parts/tight/leg_upper.png', -5.5, -2.95, None),
    'body': ('public/assets/unit-parts/tight/body.png', -11.95, -15, None),
    'head': ('public/assets/unit-parts/tight/head.png', -5.6, -18, .6),
    'arm2': ('private-assets/extracted/sprites/DefineSprite_668_MBFZ_fla.arm_front_328/51.png', -76.03631820678712, -47.00885772705078, 1),
}
canvas = Image.new('RGBA', (W, H), (45, 45, 45, 255))
for name, (path, offx, offy, aim) in assets.items():
    x, y, sx, sy, skewx, skewy = parts[name]
    if name == 'head': x, y = parts['headhold'][:2]
    if name in ('arm1', 'arm2'): x, y = parts['arm1hold'][:2]
    # SWF MATRIX is [scaleX, rotateSkew0, rotateSkew1, scaleY], which maps
    # directly to the Canvas/Pillow affine [a, b, c, d] convention.
    if aim is None: a, b, c, d = sx, skewx, skewy, sy
    else: a, b, c, d = sx, 0, 0, sy
    leg_lift = 0
    tx, ty = OX + x + a * offx + c * offy, OY + y + leg_lift + b * offx + d * offy
    det = a * d - b * c
    ia, ib, ic, id = d / det, -b / det, -c / det, a / det
    data = (ia, ic, -ia * tx - ic * ty, ib, id, -ib * tx - id * ty)
    source = Image.open(path).convert('RGBA')
    layer = source.transform((W, H), Image.Transform.AFFINE, data, Image.Resampling.BICUBIC)
    canvas.alpha_composite(layer)
canvas.save(f'private-assets/unitmc-frame{frame_number}-preview.png')
