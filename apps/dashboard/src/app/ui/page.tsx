"use client";

import React, { useState } from "react";
import { Slider } from "@/components/ui/slider";

export default function ComponentPlayground() {
  const [singleValue, setSingleValue] = useState([50]);
  const [rangeValue, setRangeValue] = useState([25, 75]);
  const [stepValue, setStepValue] = useState([0]);
  const [verticalValue, setVerticalValue] = useState([50]);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Component Playground</h1>
          <p className="text-muted-foreground">Interactive testing ground for UI components</p>
        </div>

        {/* Slider Components */}
        <div className="space-y-8">
          <div className="border rounded-lg p-6 space-y-4">
            <div>
              <h2 className="text-2xl font-semibold mb-1">Slider Component</h2>
              <p className="text-sm text-muted-foreground">Test different slider configurations</p>
            </div>

            {/* Single Value Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Single Value Slider</label>
                <span className="text-sm text-muted-foreground">Value: {singleValue[0]}</span>
              </div>
              <Slider
                value={singleValue}
                onValueChange={setSingleValue}
                min={0}
                max={100}
                step={1}
                showDots
              />
            </div>

            {/* Range Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Range Slider with Dots</label>
                <span className="text-sm text-muted-foreground">
                  Range: {rangeValue[0]} - {rangeValue[1]}
                </span>
              </div>
              <Slider
                value={rangeValue}
                onValueChange={setRangeValue}
                min={0}
                max={100}
                step={1}
                showDots
              />
            </div>

            {/* Step Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Step Slider (step: 10)</label>
                <span className="text-sm text-muted-foreground">Value: {stepValue[0]}</span>
              </div>
              <Slider value={stepValue} onValueChange={setStepValue} min={0} max={100} step={10} />
            </div>

            {/* Disabled Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Disabled Slider</label>
                <span className="text-sm text-muted-foreground">Value: 60</span>
              </div>
              <Slider defaultValue={[60]} min={0} max={100} disabled />
            </div>

            {/* Vertical Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Vertical Slider with Dots</label>
                <span className="text-sm text-muted-foreground">Value: {verticalValue[0]}</span>
              </div>
              <div className="flex justify-center py-8">
                <Slider
                  value={verticalValue}
                  onValueChange={setVerticalValue}
                  min={0}
                  max={100}
                  step={1}
                  orientation="vertical"
                  showDots
                />
              </div>
            </div>

            {/* Custom Range Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Custom Range (-100 to 100)</label>
                <span className="text-sm text-muted-foreground">Value: {singleValue[0] * 2 - 100}</span>
              </div>
              <Slider value={singleValue} onValueChange={setSingleValue} min={0} max={100} step={1} />
            </div>
          </div>

          {/* Add more component sections here as needed */}
          <div className="border rounded-lg p-6 space-y-4">
            <div>
              <h2 className="text-2xl font-semibold mb-1">Add More Components</h2>
              <p className="text-sm text-muted-foreground">This playground can be extended with other UI components</p>
            </div>
            <div className="h-32 flex items-center justify-center border-2 border-dashed rounded">
              <p className="text-muted-foreground">Add more components here...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
