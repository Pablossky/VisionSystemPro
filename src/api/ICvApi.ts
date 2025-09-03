
export type ElementMeasurement = {
    mainContour: ContourMeasurement,
    additionalContours: Array<ContourMeasurement>
}

export type ContourMeasurement = {
    points: Array<ContourMeasurementPointResult>,
    vcuts: Array<ContourMeasurementVcutResult>
}
export type ContourMeasurementPointResult = {
    position: Point,
    modelPosition: Point,
    direction: number,
    distance: number,
    i: number,
    notRelevantAsContour?: boolean
}

export type Point = [number, number]

export type ContourMeasurementVcutResult = {
    found: true,
    depth: number;
    width: number;
    startPointIdx: number;
    endPointIdx: number;
    highestDepthIdx: number;
} | {
    found: false
}

export type CalibrationInfo = {
    px_for_mm: number, /* rename? */
    boardAreaBox: ObjectBox,
    coveredAreaBox: ObjectBox,
    camerasInfo: Array<CameraInfo>
}

export type CameraInfo = {
    cameraName: string,
    coveredBox: ObjectBox,
}

export type ObjectBox = { /* in mm */
    x: number,
    y: number,
    width: number
    height: number,
    angle:number
}

export type MeasurementInfo = {
    imagesCaptures: boolean,
    elementsDetected: boolean,
    measuredElementIndexes: Array<number>,
}

export type DetectedElement = {
    i: number /* index number, unique for element in measurement */
    shapeComparisons: Array<ShapeComparison>
    elementBox: ObjectBox,
}

export type ShapeComparison = {
    shape: ShapeDescription,
    reversed: boolean,
    diff: number,
}

export type ShapeDescription = {
    _id: string,
    name: string,
}

export type Shape = {
  _id: string,
  name:string
  mainContour:ContourInfo,
  additionalContours:Array<ContourInfo>
}


export type ContourInfo = {
  fullContour:Array<Point>,
  noCutsContour:Array<Point>,
  vcuts:Array<Vcut>
}


export type Vcut = {
    position:Point,
    direction:number,
    width:number,
    depth:number,
}




export type ICvApi = {
    getCalibrationInfo: () => Promise<{ calibrationInfo: CalibrationInfo | null }>,
    takeCalibrationPhotos: () => Promise<{}>,

    getMeasurementInfo: () => Promise<{ measurementInfo: MeasurementInfo }>,
    takeMeasurementPhotos: () => Promise<{}>,
    detectElements: () => Promise<{}>,
    getDetectedElements: () => Promise<{ detectedElements: Array<DetectedElement> }>
    measureElement: (elementI: number, shapeId: string, elementThickness: number) => Promise<{}>
    getMeasuredElement: (elementI: number) => Promise<{ measurement: ElementMeasurement }>

    clearMeasurementData(): Promise<{}>

    listShapes():Promise<{shapes:Array<ShapeDescription>}>
    readShape(id:string):Promise<{shape:Shape|null}>

}