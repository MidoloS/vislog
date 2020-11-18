import React, {useEffect} from "react";
import {Bars, Curve, Pie, HorizontalBar, AnimatedPieToFix} from "../components/index"
import appleStock from '@visx/mock-data/lib/mocks/appleStock';

export default function Home() {


  const apple = appleStock.reduce((acc, el) => acc.concat({date: el.date, value: el.close}), [])

  const data = [...Array(7)].reduce((acc, el, index) => acc.concat({index: index, value: Math.floor(Math.random() * 400), message: `Message #${index+1}`}), [])


  // hsla(212, 52%, ${(n + 1) * 10 + 10}%)

  const colors = [...Array(7)].reduce((acc, el, n) => acc.concat(`hsla(212, 52%, ${(n + 1) * 10 + 10}%)`), [])

  useEffect(() => {
    console.log(apple)
  }, []);

  return (
    <>
      <Curve data={apple} width={700} height={350}/>
      <Bars data={data} width={700} height={350}/> 
      <HorizontalBar data={data} width={450} height={400}/>
      <AnimatedPieToFix data={data} colors={colors} radius={250}/>
    </>
  )
}
