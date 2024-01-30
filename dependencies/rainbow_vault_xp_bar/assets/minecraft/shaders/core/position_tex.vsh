#version 150

#define EQ(a,b) (length(a-b)<0.001)

#define CTRLPIXEL vec4(221.0/255.0, 206.0/255.0, 19.0/255.0, 255.0/255.0)
#define CTRLLOC_1 vec2(2.0/256.0, 8.0/256.0)
#define CTRLLOC_2 vec2(303.0/1024.0, 350.0/1024.0)

in vec3 Position;
in vec2 UV0;

uniform sampler2D Sampler0;

uniform mat4 ModelViewMat;
uniform mat4 ProjMat;

out vec2 texCoord0;

flat out int animateFlag;

void main() {
    gl_Position = ProjMat * ModelViewMat * vec4(Position, 1.0);
    
    texCoord0 = UV0;

    animateFlag = 0;
    ivec2 texSize = textureSize(Sampler0, 0);
    vec2 coords = UV0 * texSize;
    if ((texSize.x == 256 && texSize.y == 256 // atlas size
        && EQ(texture(Sampler0, CTRLLOC_1), CTRLPIXEL) // checks specific pixel value
        && coords.x >= 1 && coords.x <= 86 && coords.y >= 7 && coords.y <= 13) 
		|| (texSize.x == 1024 && texSize.y == 1024 // atlas size
        && EQ(texture(Sampler0, CTRLLOC_2), CTRLPIXEL) // checks specific pixel value
        && coords.x >= 302 && coords.x <= 385 && coords.y >= 349 && coords.y <= 355)) {
      animateFlag = 1;
    }
}
