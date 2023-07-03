const theme = 'theme'; //stores settings on local browser. This will remember user settings
const dataTheme = 'data-theme';
const themeTab = '.theme-tab'; // ( . ) collects attribute/class
const switcherBtn = '.switcher-btn';
const dark = 'dark';
const light = 'light';
const open = 'open';
const active = 'active';


const modalOpen = '[data-open]';
const modalClose = '[data-close]';
const isVisible = 'is-visible';

//to access the root page we can store a selector inside a variable
const root = document.documentElement; //gives us a shorthand way to use 

//Theme
const toggleTheme = document.querySelector(themeTab);
const switcher = document.querySelectorAll(switcherBtn);
const currentTheme = localStorage.getItem(theme);


//Modal
const openModal = document.querySelectorAll(modalOpen);
const closeModal = document.querySelectorAll(modalClose);

const setActive = (elm, selector) => { //function for theme selection
  if (document.querySelector(`${selector}.${active}`) !== null) {
    document.querySelector(`${selector}.${active}`).classList.remove(active);
  }
  elm.classList.add(active); //keeps selection on active button
};

//setting theme for webpage when it switches from light to dark
const setTheme = (val) => {
  if (val === dark) {
    root.setAttribute(dataTheme, dark); //two parameters
    localStorage.setItem(theme, dark);
  } else {
    root.setAttribute(dataTheme, light);
    localStorage.setItem(theme, light);
  }
};

if (currentTheme) { //this stores current theme
  root.setAttribute(dataTheme, currentTheme);
  switcher.forEach((bnt) => {
    bnt.classList.remove(active);
  });

  if (currentTheme === dark) {
    switcher[1].classList.add(active);
  } else {
    switcher[0].classList.add(active);
  }
}

//Open tab 
toggleTheme.addEventListener('click', function() {
  const tab = this.parentElement.parentElement;
  if (!tab.className.includes(open)) {
    tab.classList.add(open);
  } else {
    tab.classList.remove(open);
  }
});

for (const elm of switcher) { //this is for the toggle button
  elm.addEventListener('click', function() {
    const toggle = this.dataset.toggle;
    setActive(elm, switcherBtn);
    setTheme(toggle);
  })
}

//Full Site Modal "open buttons"
for (const elm of openModal) {
  elm.addEventListener('click', function() {
    const modalId = this.dataset.open;
    document.getElementById(modalId).classList.add(isVisible);
  })
}

for (const elm of closeModal) {
  elm.addEventListener('click', function(){
    this.parentElement.parentElement.classList.remove(isVisible);
  })
}