class Slider {
    constructor(sliderData, sliderElement) {
        this.sliderControlsState = "";
        this.sliderCurrentImage = sliderData.currentImage;
        this.sliderDirection = "";
        this.sliderImageQueue = [];
        this.slideControlState = {
            both: "both",
            leftOnly: "leftOnly",
            rightOnly: "rightOnly"
        };
        this.slideDirection = {
            left: "left",
            right: "right"
        }
        this.sliderData = sliderData;
        this.sliderElement = sliderElement;
    }

    initSlider() {
        const data = this.sliderData;
        
        this.initSliderImage(data);
        if (!data.modeAuto) {
            this.initSliderEvents()
            this.setSlideControlsState(this.slideControlState.rightOnly);
        } else { 
            this.sliderControlsVisibleState(false);
            this.sliderAuto();
        }

        return true;
    }

    initSliderImage(data) {
        let imgElement = this.sliderElement.querySelector(".slider-current");
        imgElement.id = this.formatSliderImageNumber(this.sliderCurrentImage, data.imageCounterFormat, true);
        this.sliderImageQueue.push(imgElement.id);
        imgElement.addEventListener("animationend", this.sliderAnimationEnd.bind(this));
        
        this.setSlideDirection(this.slideDirection.left);
        this.loadImage(this.sliderCurrentImage, data, imgElement).then((imgBlob) => {
            imgElement.src = URL.createObjectURL(imgBlob);
        });

        return true;
    }

    initSliderEvents() {
        let slideControlLeft = this.sliderElement.querySelector(".slider-control-left");
        let slideControlRight = this.sliderElement.querySelector(".slider-control-right");

        slideControlLeft.addEventListener("click", () => {
            const data = this.sliderData;
            let counter = this.sliderCurrentImage - 1;
            let load = false;
    
            if (counter === 1) {
                this.setCurrentSlideNumber(counter);
                this.slideControlsState(this.slideControlState.rightOnly);
                load = true;
            } else if (counter <= data.numberOfImages) {
                this.setCurrentSlideNumber(counter);
                this.slideControlsState(this.slideControlState.both);
                load = true;
            }
    
            if (load) {
                this.sliderControlsVisibleState(false);
                this.addImage(this.slideDirection.right, counter, data);
            }
        });
    
        slideControlRight.addEventListener("click", () => {
            const data = this.sliderData;
            let counter = this.sliderCurrentImage + 1;
            let load = false;
            if (counter < data.numberOfImages) {
                this.setCurrentSlideNumber(counter);
                this.slideControlsState(this.slideControlState.both);
                load = true;
            } else if (counter === data.numberOfImages) {
                this.setCurrentSlideNumber(counter);
                this.slideControlsState(this.slideControlState.leftOnly);
                load = true;
            }
           
            if (load) {
                this.sliderControlsVisibleState(false);
                this.addImage(this.slideDirection.left, counter, data);
            }
        });    
    }

    sliderAuto() {
        let interval = setInterval(() => {
            const data = this.sliderData;
            let counter = 0;
    
            if (this.sliderCurrentImage <= data.numberOfImages) {
                counter = this.sliderCurrentImage + 1;
            } 

            if (this.sliderCurrentImage >= data.numberOfImages) {
                counter = 1;
            }
        
            this.setCurrentSlideNumber(counter);
            this.addImage(this.slideDirection.left, counter, data);
        }, 5000);
    }

    addImage(direction, counter, data) {
        this.loadImage(counter, data).then((imgBlob) => {
            let time = data.slideTime;
            let imgCurrent = this.sliderElement.querySelector(".slider-current");
            let sliderImagesContainer = this.sliderElement.querySelector(".slider-images-container");
            let img = document.createElement("img");
            let className = direction === this.slideDirection.left ? "slider-next" : "slider-previous";
            let animation = direction === this.slideDirection.left ? "slideLeft " + time + " ease-in 0s 1 forwards" : "slideRight " + time + " ease-in 0s 1 forwards"
            
            img.id = this.formatSliderImageNumber(counter, data.imageCounterFormat, true);
            this.sliderImageQueue.push(img.id);
            this.setSlideDirection(direction);
            img.classList.add(className);
            img.src = URL.createObjectURL(imgBlob);
            sliderImagesContainer.appendChild(img);
            imgCurrent.style.animation = animation;
        });
    }

    sliderAnimationEnd() {
        const data = this.sliderData;
        let elementToRemove = this.sliderImageQueue.shift();
        let className = this.sliderDirection === "left" ? "slider-next" : "slider-previous";
        let imgCurrent = this.sliderElement.querySelector("#" + elementToRemove);
        
        let img = this.sliderElement.querySelector("." + className);
        img.classList.add("slider-current")
        imgCurrent.style.display = "none";
        img.classList.remove(className)
        imgCurrent.remove();
        img.addEventListener("animationend", this.sliderAnimationEnd.bind(this));

        if (!data.modeAuto) {
            this.sliderControlsVisibleState(true);
        }
    }

    sliderControlsVisibleState(show) {
        let sliderControls = this.sliderElement.querySelector(".slider-controls");
        
        if (show) {
            sliderControls.style.visibility = "visible";
        } else {
            sliderControls.style.visibility = "hidden";
        }
    }

    loadImage(imageNumberToLoad, data) {
        const imagePath = data.imageFolder + "/" + data.imageName + this.formatSliderImageNumber(imageNumberToLoad, data.imageCounterFormat, false) + "." + data.imageExtension
        
        return fetch(imagePath)
        .then((response) => response.blob())
        .catch((error) => {
            console.log(error);
        });
    }

    formatSliderImageNumber(number, format, usePrefix) {
        let formatNumber = "";
        
        for (let i = 0; i < format.length - String(number).length; i++) {
            formatNumber += "0";
        }

        formatNumber += number; 

        if (usePrefix) {
            formatNumber = "slider-image" + formatNumber + "-" + this.getRandomInt(1, 99999);
        }

        return formatNumber;
    }

    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
    }

    slideControlsState(state) {
        if (this.getSlideControlsState() !== state) {
            let slideControls = this.sliderElement.querySelector(".slider-controls");
            let slideControlLeft = this.sliderElement.querySelector(".slider-control-left");
            let slideControlRight = this.sliderElement.querySelector(".slider-control-right");
        
            if (state === this.slideControlState.both) {
                slideControlLeft.style.display = "block";
                slideControlRight.style.display = "block";
                slideControls.style.justifyContent = "space-between";
            } else if (state === this.slideControlState.leftOnly) {
                slideControlLeft.style.display = "block";
                slideControlRight.style.display = "none";
                slideControls.style.justifyContent = "flex-start";
            } else if (state === this.slideControlState.rightOnly) {
                slideControlLeft.style.display = "none";
                slideControlRight.style.display = "block";
                slideControls.style.justifyContent = "flex-end";
            }
        }
    
        this.setSlideControlsState(state);

        return state;
    }

    setSlideControlsState(state) {
        this.sliderControlsState = state;
        return state;
    }

    getSlideControlsState() {
        return this.sliderElement.dataset.sliderControlsState
    }

    setCurrentSlideNumber(slideNumber) {
        this.sliderCurrentImage = slideNumber;
        return slideNumber;
    }

    setSlideDirection(direction) {
        this.sliderDirection = direction;
        return direction;
    }
}