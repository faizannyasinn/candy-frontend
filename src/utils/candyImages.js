// Array of all 15 image imports
const candyImages = Array.from({ length: 15 }, (_, i) =>
  require(`../assets/candies/candy${i + 1}.png`)
);

export default candyImages;
