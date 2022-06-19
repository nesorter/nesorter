const theme: Record<string, any> = {
  colors: {
    dark100: '#333333',
    dark200: '#555555',
    textDark: '#555555',
    textLight: '#ffffff',
    green100: '#60834B',
  },
  fontSizes: [12, 14, 16, 20, 24, 32],
  space: [0, 4, 8, 16, 32, 64, 128, 256, 512],
};

theme.space.sm = theme.space[1];
theme.space.md = theme.space[2];
theme.space.lg = theme.space[3];

theme.fontSizes.sm = theme.fontSizes[0];
theme.fontSizes.desc = theme.fontSizes[1];
theme.fontSizes.body = theme.fontSizes[2];
theme.fontSizes.heading = theme.fontSizes[3];

export default theme;
