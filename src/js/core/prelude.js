(function(){
'use strict';
const $=id=>document.getElementById(id);
const TAU=Math.PI*2;
const rnd=(a,b)=>a+Math.random()*(b-a);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const pickOf=a=>a[Math.floor(Math.random()*a.length)];
const VR=Math.random; /* «визуальный» случай: не влияет на игру (в совместной игре Math.random подменяется общим сидом) */
/* размер «вида» для логики (спавн за краем экрана, зона загрузки карты): в совместной игре одинаков у всех */
const simVW=()=>COOP?1600:VW,simVH=()=>COOP?1000:VH;
const RM=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
const WPM=8;             /* волн на одной карте */
const WAVES_TOTAL=24;    /* волн в главе: 3 карты по 8 */

