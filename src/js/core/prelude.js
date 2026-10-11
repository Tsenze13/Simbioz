(function(){
'use strict';
const $=id=>document.getElementById(id);
const TAU=Math.PI*2;
const rnd=(a,b)=>a+Math.random()*(b-a);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const pickOf=a=>a[Math.floor(Math.random()*a.length)];
const RM=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
const WAVES_TOTAL=24;

