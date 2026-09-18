import React, { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  initBgAnimation,
  setAnimatedBgEnabled,
  setAnimatedBgShape,
  setAnimatedBgBrightness,
  setAnimatedBgSpeed,
} from '../modules/bgAnimation.js';

export default function BackgroundAnimation() {
  const { bgAnim, bgShape, bgBrightness, bgSpeed } = useApp();
  const canvasRef = useRef(null);

  useEffect(() => {
    initBgAnimation();
  }, []);

  useEffect(() => {
    setAnimatedBgEnabled(bgAnim);
  }, [bgAnim]);

  useEffect(() => {
    setAnimatedBgShape(bgShape);
  }, [bgShape]);

  useEffect(() => {
    setAnimatedBgBrightness(bgBrightness);
  }, [bgBrightness]);

  useEffect(() => {
    setAnimatedBgSpeed(bgSpeed);
  }, [bgSpeed]);

  return <canvas id="bgAnimationCanvas" ref={canvasRef} className="bg-animation-canvas" />;
}
