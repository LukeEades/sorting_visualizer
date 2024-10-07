const play = document.getElementById("play");
const reset = document.getElementById("reset");
const step = document.getElementById("step");
const sort_selections = document.getElementById("sort");
const canvas_parent = document.getElementById("canvas_frame");

let WIDTH = 700;
let HEIGHT = 700;

let n = 50;
let tex_buff;
let canvas_tex;
let arr = [];
let stack = [];
let canvas;
let options;

function setup(){
    noSmooth();
    canvas = createCanvas(WIDTH, HEIGHT, WEBGL);
    canvas.parent("#canvas_parent");
    let canvas_options = {width:n, height:n, textureFiltering: NEAREST};
    textureMode(IMAGE);
    textureWrap(COVER);
    noStroke();
    pixelDensity(1);
    tex_buff = createFramebuffer(canvas_options); 
    tex_buff.loadPixels();
    tex_buff.pixelDensity(1);
    canvas_tex = canvas.getTexture(tex_buff);
    canvas_tex.setInterpolation(NEAREST, NEAREST);
    for(let i = 0; i < n; i++){
        arr[i] = i + 1;
    }
    shuffle_arr(arr);
    options = {index: 0, left_start:0, curr_size:1, heap_index: Math.floor(arr.length / 2) - 1, heapifying: false, stack: []};
    options.stack.push(0);
    options.stack.push(arr.length);
    options.stack.push(0);
    options.stack.push(0);
    reset_arr(options);
    background(0);
    fill_tex(arr, tex_buff);
    draw_tex(tex_buff);
}

function reset_arr(options){
    options.index = 0;
    options.left_start = 0;
    options.curr_size = 1;
    options.heap_index = Math.floor(arr.length / 2) - 1;
    options.heapifying = false;
    options.stack.length = 0;
    options.stack.push(0);
    options.stack.push(arr.length);
    options.stack.push(0);
    options.stack.push(0);
    current_sort = sort_selections.value;
    background(0);
    shuffle_arr(arr);
    background(0);
    fill_tex(arr, tex_buff);
    draw_tex(tex_buff);
    paused = true;
    play.textContent = "play";
}

let current_sort = "bubble";
let sorts = {selection: selection_sort, insertion: insertion_sort, heap: heap_sort, quick: quick_sort, bubble: bubble_sort, merge: merge_sort};

let left_start = 0;
let curr_size = 1;
let counter = 0;
let paused = true;
let finished = true;
let heap = false;
function draw(){
    counter++;
    if(counter % 1 == 0 && !paused){
        background(0);
        sorts[current_sort](arr, options);
        fill_tex(arr, tex_buff);
        draw_tex(tex_buff);
    }
}

function fill_tex(arr, tex){
    for(let i = 0; i < arr.length; i++){
        tex_line(tex, i, arr[i]);
    }
}

function tex_line(tex, x, height){
    tex.loadPixels();
    for(let y = 0; y < n; y++){
        let index = 4 * (y * n + x);
        let color = 0;
        if(y < n - height){
            color = 255;
        }
        tex.pixels[index] = color;
        tex.pixels[index + 1] = color;
        tex.pixels[index + 2] = color;
        tex.pixels[index + 3] = color;
    } 
    tex.updatePixels();
}

function draw_tex(tex){
    texture(tex);
    quad(-WIDTH/2, -HEIGHT/2, WIDTH/2, -HEIGHT/2, WIDTH/2, HEIGHT/2, -WIDTH/2, HEIGHT/2);
}

function partition(arr, start, end){
    let mid_index = Math.floor(start + (end - start)/2);
    swap(arr, mid_index, start);
    let less = start;
    for(let i = start; i < end; i++){
        if(arr[i] < arr[start]){
            swap(arr, i, ++less);
        }
    }
    swap(arr, start, less);
    return less;
}

function pick_midpoint(start, end){
    return start + Math.floor(Math.random() * (end - start));
}


// TODO: something fucky here
function quick_sort(arr, options){
    let stack = options.stack;
    if(stack.length > 0){
        let part = stack.pop();
        let index = stack.pop();
        let end = stack.pop();
        let start = stack.pop();

        while(index < end && arr[index] >= arr[start]){
            index++;
        }

        if(index >= end){
            swap(arr, start, part);
            if(part > start){
                stack.push(start);
                stack.push(part);
                stack.push(start);
                stack.push(start);
                swap(arr, start, pick_midpoint(start, part));
            }
            if(part + 1 < end){
                stack.push(part);
                stack.push(end);
                stack.push(part);
                stack.push(part);
                swap(arr, part, pick_midpoint(part, end));
            }
        }else{
            swap(arr, index, ++part);
            index++;
            stack.push(start);
            stack.push(end);
            stack.push(index);
            stack.push(part);
        }
    }else{
        paused = true;
        play.textContent = "play";
    }
}

function insertion_sort(arr, options){
    // build sorted array by inserting elements at the right position
    let i = options.index;
    if(i < arr.length){
        // loop up until i and push elements to i
        let temp = arr[i];
        let j = i;
        for(; j > 0; j--){
            if(arr[j - 1] > temp){
                arr[j] = arr[j - 1]; 
            }else{
                break;
            }
        }
        arr[j] = temp;
        options.index++;
    }else{
        paused = true;
        play.textContent = "play";
    }
}

function selection_sort(arr, options){
    // iterate through and at each iteration place the smalest element outside of sorted area at the end of the sorted area
    let i = options.index;
    if(i < arr.length){
        let small_index = i;
        for(let j = i; j < arr.length; j++){
            small_index = arr[j] < arr[small_index]? j: small_index;
        }
        swap(arr, i, small_index);
        options.index++;
    }else{
        paused = true;
        play.textContent = "play";
    }
}

function heap_sort(arr, options){
    let index = options.heap_index;
    let heap = options.heapifying;
    if(heap){
        if(index > 0){
            options.heap_index--;
            swap(arr, index, 0);
            heapify(arr, index, 0);
        }else{
            paused = true;
            play.textContent = "play";
        }
    }else{
        options.heap_index--;
        heapify(arr, arr.length, options.heap_index);
        if(options.heap_index == 0){
            options.heapifying = true;
            options.heap_index = arr.length - 1;
        }
    }
}

function bubble_sort(arr, options){
    let i = options.index;
    if(i < arr.length){
        //let j = i % arr.length;
        for(let j = 0; j + 1 < arr.length; j++){
            if(arr[j] > arr[j + 1]){
                swap(arr, j + 1, j);
                swapped = true;
            }
        }
        if(!swapped){
            i = arr.length;
        }
        options.index++;
    }else{
        paused = true;
        play.textContent = "play";
    }
}

function merge_sort(arr, options){
    let n = arr.length;
    curr_size = options.curr_size;
    left_start = options.left_start;
    if(curr_size <= n - 1){
        if(left_start < n - 1){
            let mid = Math.min(left_start + curr_size - 1, n - 1);

            let right_end = Math.min(left_start + 2 * curr_size - 1, n - 1);

            merge(arr, left_start, mid, right_end);
            options.left_start += curr_size * 2;
        }else{
            options.left_start = 0;
            options.curr_size *= 2;
        }
    }else{
        paused = true;
        play.textContent = "play";
    }
}

function insertion(arr, start = 0, end = arr.length){
    for(let i = start; i < end; i++){
        // while index is less than
        let j = i;
        while(j > 0 && arr[j - 1] > arr[j]){
            swap(arr, j, j - 1);
            j--;
        }
    }
}

function merge_sort_recurse(arr, l = 0, r = arr.length - 1, size_lim = arr.length - 1){
    if(r - l + 1 < size_lim){
        insertion(arr, l, r + 1);
        return;
    }
    let m = Math.floor(l + (r - l)/2);
    merge_sort_recurse(arr, l, m);
    merge_sort_recurse(arr, m + 1, r);
    merge(arr, l, m, r);
}

function tim_sort(arr){
    // do a mergesort but if the size of the arrays are less than pre-chosen range then do insertion sort instead
    if(arr.length <= 64){
        // do insertion sort
        insertion(arr);
    }else{
        let SPLIT_SIZE = 64;
        let len = arr.length - 1;
        merge_sort_recurse(arr, 0, len, SPLIT_SIZE);
        // split into merge-able arrays and insertion sort each of them
    }
}

function merge(arr, l, m, r){
    let n1 = m - l + 1;
    let n2 = r - m;
    let arr1 = [];
    let arr2 = [];
    for(let i = 0; i < n1; i++){
        arr1[i] = arr[i + l];
    }
    for(let i = 0; i < n2; i++){
        arr2[i] = arr[i + m + 1];
    }
    let i = 0;
    let j = 0;
    let index = l;
    for(; i < arr1.length && j < arr2.length;){
        if(arr1[i] <= arr2[j]){
            arr[index++] = arr1[i++];
        }else{
            arr[index++] = arr2[j++];
        }
    }

    for(; i < arr1.length; i++){
        arr[index++] = arr1[i];
    }
    for(; j < arr2.length; j++){
        arr[index++] = arr2[j];
    }
}

function heapify(arr, len, index){
    let largest = index;
    let left = 2 * largest + 1;
    let right = 2 * largest + 2;

    if(left < len && arr[left] > arr[largest]){
        largest = left;
    }
    if(right < len && arr[right] > arr[largest]){
        largest = right;
    }
    if(largest != index){
        swap(arr, largest, index);
        heapify(arr, len, largest);
    }
}

function swap(arr, a, b){
    let temp = arr[a];
    arr[a] = arr[b];
    arr[b] = temp;
}

function shuffle_arr(arr){
    for(let i = 0; i < arr.length; i++){
        let j = Math.floor(Math.random() * arr.length);
        swap(arr, i, j);     
    }
}

play.addEventListener("click", ()=>{
    paused = !paused;
    if(finished){
        current_sort = sort_selections.value;
        finished = false;
    }
    play.textContent = paused? "play": "pause";
});

reset.addEventListener("click", ()=>{
    reset_arr(options);
});

step.addEventListener("click", ()=>{
    if(paused){
        background(0);
        sorts[current_sort](arr, options);
        fill_tex(arr, tex_buff);
        draw_tex(tex_buff);
    }
});