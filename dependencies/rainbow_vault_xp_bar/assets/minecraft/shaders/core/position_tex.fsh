#version 150

uniform sampler2D Sampler0;

uniform vec4 ColorModulator;
uniform float GameTime;

in vec2 texCoord0;

flat in int animateFlag;

out vec4 fragColor;

void main() {
    vec4 color = texture(Sampler0, texCoord0);
    if (color.a == 0.0) {
        discard;
    }

    if (animateFlag == 1 && color.r > 0.5) {
      float time = GameTime * 600 + texCoord0.x * 2 + texCoord0.y * 20;
      float red = pow(sin(time), 2);
      float green = pow(sin(time + 2), 2);
      float blue = pow(sin(time + 4), 2);

      float lumi = 0.5 * (0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b) + 0.5;
      color = vec4(red * lumi, green * lumi, blue * lumi, 1.0);
    }

    fragColor = color * ColorModulator;
}
