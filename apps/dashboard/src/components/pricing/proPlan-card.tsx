"use client"

import React, { useState } from 'react'
import { PricingCard } from './pricing-cards'
import CheckeredLine from '../icons/CheckeredLine'
import ArrowRightPricing from '../icons/ArrowRightPricing'
import ProPlanTriangleDown from '../icons/ProPlanTriangleDown'
import ProPlanTriangleUp from '../icons/ProPlanTriangleUp'
import ProPlanPriceNumber from '../icons/ProPlanPriceNumber'
import { motion } from 'motion/react'

const ProPlanCard = ({ title, price, description, features, buttonConent }: PricingCard) => {

    const [isHovered, setIsHovered] = useState(false);

    return (
        <div className='relative h-fit w-[360px] flex flex-col justify-between gap-1.5'>
            <div className='absolute left-0 top-[-36px] rounded-tr-[12px]'>
                <div className="relative p-[0.5px] overflow-hidden rounded-tr-[12px]">
                    <div className="gradient_border_proplan_button" />
                    <div className='relative px-2.5 pt-1.5 pb-8 bg-gradient-pricing-recommended rounded-tr-[12px]'>
                        <h3 className='text-[14px] text-white'>Recommended</h3>
                    </div>
                </div>
            </div>

            <div className='relative h-full rounded-2xl backdrop-blur-2xl'
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <motion.div
                    style={{ transformOrigin: 'top center', willChange: 'transform' }}
                    className='inset-0 z-0 absolute w-full h-full rounded-[18px] bg-gradient-proplan-hover pt-[15px] pl-4.5'
                    animate={{ scaleX: isHovered ? 1.025 : 1, scaleY: isHovered ? 1.10175 : 1 }}
                    transition={{ ease: [0.4, 0, 0.2, 1], duration: 0.5 }}
                >
                    <h3 className='text-[#601100] text-xs '>
                        We highly recommend this plan
                    </h3>
                </motion.div>

                <motion.div
                    style={{ willChange: 'transform' }}
                    className='relative overflow-hidden p-[1px] h-full rounded-2xl '
                    animate={{ y: isHovered ? '45px' : '0' }}
                    transition={{ ease: [0.4, 0, 0.2, 1], duration: 0.5 }}
                >

                    <div className="gradient_border_proplan" />

                    <div className='relative z-10 overflow-hidden h-full px-6 pt-8 pb-10 bg-[#030303] rounded-2xl
                flex flex-col justify-between items-start gap-6
                '>
                        <div className='absolute z-[-8] bottom-0 left-0'>
                            <ProPlanTriangleDown />
                        </div>

                        <div className='absolute z-[-10] top-0 left-0'>
                            <ProPlanTriangleUp />
                        </div>

                        <div className='flex flex-col gap-6'>
                            <h2 className='text-base'>
                                {title}
                            </h2>
                            <div className="flex flex-col gap-4">
                                <div className='flex flex-row gap-2'>
                                    <span className='inline-block text-base text-[#878787]'>$</span>
                                    <h2 className='text-4xl'>
                                        {/* {price} */}
                                        <ProPlanPriceNumber />
                                    </h2>
                                </div>
                                <p className='text-base'>{description}</p>
                            </div>
                        </div>

                        <div className='relative z-[-9]'>
                            <div className='w-[312px] h-[1px] border-[1px] border-[#111111]'></div>
                        </div>

                        <div className='flex flex-col w-[90%] justify-center items-start gap-3 mb-4'>
                            <p className='text-xs text-[#A5A5A5] mb-2'>
                                Everything Basic, plus:
                            </p>
                            {features.map((feature, index) => {

                                //Joshua Jake
                                if (feature.content.includes("training")) {
                                    return (
                                        <div key={index} className='flex items-center gap-2'>
                                            <div className='p-0.5 ml-[-3.5px] mb-3'>
                                                {feature.icon}
                                            </div>

                                            <p className='text-xs text-[#A5A5A5] mt-1'>
                                                {feature.content}
                                                <span className='underline cursor-pointer text-xs text-[#FFFFFF] ml-1'>Joshua Jake</span>
                                            </p>

                                        </div>
                                    )
                                }

                                return (
                                    <div key={index} className='flex items-center gap-2'>
                                        <div className='p-0.5 ml-[-3.5px]'>
                                            {feature.icon}
                                        </div>

                                        <p className='text-xs text-[#A5A5A5]'>{feature.content}</p>
                                    </div>
                                )
                            })}
                        </div>
                        <button className='w-full flex flex-row justify-between items-center mt-4 bg-white py-2.5 px-4 rounded-[40px] text-[#373737] font-semibold'>
                            {buttonConent}
                            <ArrowRightPricing />
                        </button>
                    </div>
                </motion.div>
            </div>
        </div >
    )
}

export default ProPlanCard