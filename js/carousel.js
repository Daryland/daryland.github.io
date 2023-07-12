const slides = document.querySelectorAll('.review-item');
const buttons = document.querySelectorAll('.slide-ctrl-container button');


let current = Math.floor(Math.random() * slides.length);//random selector
let next = current < slides.length - 1 ? current + 1 : 0;
let prev = current > 0 ? current - 1 : slides.length - 1;


// const dummySlides = [ 
//   slide 0
//   slide 1 - prev
//   slide 2 - current [next] = current + 1
//   slide 3 - next
// ]

/* create evenListener for prev/next */
// goToNext() 
// goToPrev()
// updateIndexes(parameter)
// updateCSS

// -- decide how to call prev/next
// -- update variables
// --- [current] = newIndex
// --- [next] current + 1 : 0
// --- [prev] current - 1 : 0
// update css classes
const update = () => {
  slides.forEach((slide) => {
    slide.classList.remove('active', 'prev', 'next');
  })
  slides[current].classList.add('active');
  slides[prev].classList.add('prev');
  slides[next].classList.add('next');
}

const goToNum = (number) => {
 current = number;
 next = current < slides.length - 1 ? current + 1 : 0;
 prev = current > 0 ? current - 1 : slides.length - 1;
 update() ; //This applies to the arrow keys
}

const goToNext = () => current < slides.length - 1 ? goToNum(current + 1) : goToNum(0);
const goToPrev = () => current > 0 ? goToNum(current - 1) : goToNum(slides.length - 1);

for (let i = 0; i < buttons.length; i += 1) { //makes decision to go forward or backwards
  buttons[i].addEventListener('click', () => i === 0 ? goToPrev() : goToNext());
}

update();//invoked means we grab the node list