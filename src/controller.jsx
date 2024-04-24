// eslint-disable-next-line no-unused-vars
import React from 'react';
import { Button, Typography } from '@mui/material';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import CircleIcon from '@mui/icons-material/Circle';
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BlurCircularIcon from '@mui/icons-material/BlurCircular';


function ModelOnScreenControls() {
    return (
        <>
            <div className="threejsControlWrapper flex w-full flex-col items-center justify-center">
                <div className="flex w-full items-center justify-center">
                    <Typography className="flex text-wrap bg-transparent text-[12px] text-white text-center">click on heatmap or press = to switch to camera inside the model before navigating, w:forward, a:left, s:backward, d:right, q:up, e:down to navigate within, while the arrow-keys to rotate camera </Typography>
                </div>
                <div className="flex w-full flex-row items-center justify-center gap-6">
                    <Button className="moveBtnWrapper flex h-28 w-28 flex-col">
                        <div className="left up"><ArrowDropUpIcon id='panForward' className='ctrlIcon z-10' fontSize='medium' /></div>
                        <div className="middle">
                            <div className="nav left"><ArrowLeftIcon id='panLeft' className='ctrlIcon z-10' fontSize='medium' /></div>
                            <div className="nav flex flex-row gap-1 justify-center items-center p-1 w-fit">
                                <div className=""><BlurCircularIcon id='panUp' className='ctrlIcon h-5 w-5 z-10' /></div>
                                <div><BlurCircularIcon id='panDown' className='ctrlIcon h-5 w-5 z-10' /></div>
                            </div>
                            <div className="nav right"><ArrowRightIcon id='panRight' className='ctrlIcon z-10' fontSize='medium' /></div>
                        </div>
                        <div className="left down"><ArrowDropDownIcon id='panBackward' className='ctrlIcon z-10' fontSize='medium' /></div>
                    </Button>
                    <div className="buttonsWrapper">
                        <Button className="controlContainer zoomContainer">
                            <div id='zoomOut' className="ctrlImg zoom z-10 flex h-10 w-10 items-center justify-center text-center">
                                <ZoomOutIcon className='zoomImg' fontSize='large' />
                            </div>
                            <div id='zoomIn' className="ctrlImg zoom z-10 flex h-10 w-10 items-center justify-center text-center">
                                <ZoomInIcon className='zoomImg' fontSize='large' />
                            </div>
                        </Button>
                        <div className="separator"></div>
                        <Button className="controlContainer cameraContainer">
                            <div id='recordButton' className="ctrlImg zoom z-10 flex h-10 w-10 items-center justify-center text-center">
                                <CircleIcon className='circle' fontSize='small' id='recordButton' />
                            </div>
                            <div id='screenshotButton' className="ctrlImg zoom z-10 flex h-10 w-10 items-center justify-center text-center">
                                <CameraAltOutlinedIcon className='camera' />
                            </div>
                        </Button>
                        <div className="separator"></div>
                        <Button className="controlContainer dimension" id='2DOverlayButton'>
                            <div className="ctrlImg z-10 flex h-10 w-10 items-center justify-center text-center">
                                2D
                            </div>
                            <div className="ctrlImg z-10 flex h-10 w-10 items-center justify-center text-center">
                                3D
                            </div>
                        </Button>
                        <div className="separator"></div>
                        <Button id='heatmapButton' className='text-center' >Heat Map</Button>
                    </div>
                    <div className="compassContainer relative"><img src="/img/Group 26986.png" alt="" />
                        <Button className="moveBtnWrapper absolute right-[-10px] top-[-0px] z-10 flex h-28 w-28 flex-col opacity-0">
                            <div className="left up bg-transparent"><ExpandLessIcon id='rotateLeft' className='ctrlIcon z-10' fontSize='medium' /></div>
                            <div className="middle">
                                <div className="nav left bg-transparent"><ChevronLeftIcon id='rotateUp' className='ctrlIcon z-10' fontSize='medium' /></div>
                                <div className="nav hide"></div>
                                <div className="nav right bg-transparent"> <ChevronRightIcon id='rotateDown' className='ctrlIcon z-10' fontSize='medium' /></div>
                            </div>
                            <div className="left down bg-transparent"><ExpandMoreIcon id='rotateRight' className='ctrlIcon z-10' fontSize='medium' /></div>
                        </Button>
                    </div>
                </div>

            </div>
        </>
    )
}

export default ModelOnScreenControls