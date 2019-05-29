import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { debug } from "util";


export class ImageCapture implements ComponentFramework.StandardControl<IInputs, IOutputs> {

	/**
	 * Empty constructor.
	 */

    /** variable for HTML elements */
    private _LoadControlElement: HTMLElement;
    private _TakePhotoButton: HTMLElement;    
    private _HideVideoButton: HTMLElement;    
    private _RetakeVideoButton: HTMLElement;    
    private _AppDiv: HTMLElement;    
    private _StartCameraAnchor: HTMLElement;
    public _VideoCameraStream: HTMLVideoElement;    
    private _SnapImage: HTMLElement;    
    private _ErrorMessage: HTMLElement;    
    private _Canvas: HTMLCanvasElement;         

    /** variable for file properties */        
    private _canvasDataURL: string;
    

    /** event variables */
    private _LoadPhotoContainer: EventListenerOrEventListenerObject;    
    private _HidePhotoContainer : EventListenerOrEventListenerObject;    
    private _TakePhotoClicked: EventListenerOrEventListenerObject;    
    private _RetakePhotoClicked: EventListenerOrEventListenerObject;    

    private _context: ComponentFramework.Context<IInputs>;
    private _notifyOutputChanged: () => void;
    private _container: HTMLDivElement;

	constructor()
	{   
	}

	/**
	 * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
	 * Data-set values are not initialized here, use updateView.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
	 * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
	 * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
	 * @param container If a control is marked control-type='starndard', it will receive an empty div element within which it can render its content.
	 */
	public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container:HTMLDivElement)
	{
		// Add control initialization code
        debugger;
        // assigning environment variables.
        this._context = context;
        this._notifyOutputChanged = notifyOutputChanged;
        this._container = container;

        // register eventhandler functions
        this._LoadPhotoContainer = this.LoadPhotoContainer.bind(this);
        this._HidePhotoContainer = this.HidePhotoContainer.bind(this);
        this._TakePhotoClicked = this.TakePhotoClicked.bind(this);
        this._RetakePhotoClicked = this.RetakePhotoClicked.bind(this);

        //Load container
        this._LoadControlElement = document.createElement("input");
        this._LoadControlElement.setAttribute("type", "button");
        this._LoadControlElement.setAttribute("value", "Load Video");
        this._LoadControlElement.setAttribute("style", "width:10%;color:white;background-color:#2e82e0;font-size:15px;padding:5px;margin:10px;border-color:black;border-style:double;");
        this._LoadControlElement.addEventListener("click", this._LoadPhotoContainer);

        //Hide container
        this._HideVideoButton = document.createElement("input");
        this._HideVideoButton.setAttribute("type", "button");
        this._HideVideoButton.setAttribute("value", "Hide Video");
        this._HideVideoButton.setAttribute("style", "width:10%;color:white;background-color:#2e82e0;font-size:15px;padding:5px;margin:10px;border-color:black;border-style:double;");
        this._HideVideoButton.addEventListener("click", this._HidePhotoContainer);

        //Div
        this._AppDiv = document.createElement("div");
        this._AppDiv.classList.add("app");
        

        // <a href="#" id="start-camera" class="visible">Touch here to start the app.</a>
        this._StartCameraAnchor = document.createElement("a");
        this._StartCameraAnchor.setAttribute("href", "#");
        //this._StartCameraAnchor.classList.add("visible");
        this._StartCameraAnchor.setAttribute("id", "start-camera");
        this._StartCameraAnchor.setAttribute("text", "Start your app here");
        
        //<video id="camera-stream"> </video>
        this._VideoCameraStream = document.createElement("video");
        this._VideoCameraStream.setAttribute("id", "camera-stream");

        //<img id="snap" >
        this._SnapImage = document.createElement("img");
        this._SnapImage.setAttribute("id", "snap");

        //<p id="error-message"></p>
        this._ErrorMessage = document.createElement("p");
        this._ErrorMessage.setAttribute("id", "error-message");
        
        //<canvas></canvas>
        this._Canvas = document.createElement("canvas");

        this._AppDiv.appendChild(this._StartCameraAnchor);
        this._AppDiv.appendChild(this._VideoCameraStream);
        this._AppDiv.appendChild(this._SnapImage);
        this._AppDiv.appendChild(this._ErrorMessage);
        this._AppDiv.appendChild(this._Canvas);
       
        ////Take Photo Button        
        this._TakePhotoButton = document.createElement("input");
        this._TakePhotoButton.setAttribute("type", "button");
        this._TakePhotoButton.setAttribute("value", "Take Snapshot");
        this._TakePhotoButton.setAttribute("style", "width:12%;color:white;background-color:#2e82e0;font-size:15px;padding:5px;margin:10px;border-color:black;border-style:double;");
        this._TakePhotoButton.addEventListener("click", this._TakePhotoClicked);


        ////ReTake Photo Button        
        this._RetakeVideoButton = document.createElement("input");
        this._RetakeVideoButton.setAttribute("type", "button");
        this._RetakeVideoButton.setAttribute("value", "ReTake Snapshot");
        this._RetakeVideoButton.setAttribute("style", "width:14%;color:white;background-color:#2e82e0;font-size:15px;padding:5px;margin:10px;border-color:black;border-style:double;");
        this._RetakeVideoButton.addEventListener("click", this._RetakePhotoClicked);

        // finally add to the container so that it renders on the UI.
        this._container.appendChild(this._AppDiv);
        this._container.appendChild(this._LoadControlElement);
        this._container.appendChild(this._TakePhotoButton);        
        this._container.appendChild(this._HideVideoButton);
        this._container.appendChild(this._RetakeVideoButton);
        //
        this.HideUI();
	}

    //Methods
    public HideUI() {
        this._StartCameraAnchor.classList.remove("visible");
        this._VideoCameraStream.classList.remove("visible");
        this._SnapImage.classList.remove("visible");
        this._ErrorMessage.classList.remove("visible");
        this._HideVideoButton.classList.remove("visible");
        this._TakePhotoButton.classList.remove("visible");
        this._RetakeVideoButton.classList.remove("visible");        
    }

    public showVideo() {
        this.HideUI();
        this._VideoCameraStream.classList.add("visible");
        this._HideVideoButton.classList.add("visible");
        this._TakePhotoButton.classList.add("visible");        
        this._RetakeVideoButton.classList.add("visible");        
    }

    public takeSnapshot() {
        // Here we're using a trick that involves a hidden canvas element.  
        debugger;
        var canvascontext = this._Canvas.getContext("2d");
        var width = this._VideoCameraStream.videoWidth;
        var height = this._VideoCameraStream.videoHeight;

        if (width && height) {
            // Setup a canvas with the same dimensions as the video.
            this._Canvas.width = width;
            this._Canvas.height = height;

            // Make a copy of the current frame in the video on the canvas.
            // @ts-ignore
            canvascontext.drawImage(this._VideoCameraStream, 0, 0, width, height);

            // Turn the canvas image into a dataURL that can be used as a src for our photo.
            this._canvasDataURL = this._Canvas.toDataURL('image/png');
        }
    }

    public displayErrorMessage(strMsg: string) {
        this.HideUI();
        this._ErrorMessage.setAttribute("innerText", strMsg);
        this._ErrorMessage.classList.add("visible");
    }

	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void
	{
        // Add code to update control view  
        // @ts-ignore
        var crmScreenshotOutcome = this._context.parameters.ImageSnapshot.attributes.LogicalName;

        // setting CRM field values here.
        // @ts-ignore
        Xrm.Page.getAttribute(crmScreenshotOutcome).setValue(this._context.parameters.ImageSnapshot.formatted);

        //If Image already available then set it to field.
        // @ts-ignore
        var crmScreenshotIntialOutcome = this._context.parameters.ImageSnapshot.attributes.LogicalName;
        // @ts-ignore
        var strInitialOutcome =  Xrm.Page.getAttribute(crmScreenshotIntialOutcome).getValue();
        if (strInitialOutcome != null && strInitialOutcome != undefined && strInitialOutcome != "") {
            var snap = strInitialOutcome;
            // Show image.        
            this._SnapImage.setAttribute('src', snap);
            this._SnapImage.classList.add("visible");
        }
	}

	/** 
	 * It is called by the framework prior to a control receiving new data. 
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs
	{
        return {
            ImageSnapshot: this._canvasDataURL
        }; 
	}

	/** 
	 * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
	 * i.e. cancelling any pending remote calls, removing listeners, etc.
	 */
	public destroy(): void
	{
		// Add code to cleanup control if necessary
    }

    // event handlers
    public LoadPhotoContainer(evt: Event): void {
        debugger;               
        var self = this;
        var getUserMedia  = (navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia);

        if (!getUserMedia) {
            this.displayErrorMessage("Your browser doesn't have support for the navigator.getUserMedia interface.");
        }
        else {
            // Request the camera.
            navigator.mozGetUserMedia(
                {
                    video: true
                },
                function (stream) { 
                    debugger;
                    self._VideoCameraStream.src = window.URL.createObjectURL(stream);
                    self._VideoCameraStream.play();
                    self._VideoCameraStream.onplay = function () {
                        debugger;
                        self.showVideo();
                    };
                },                
                // Error Callback
                function (err) {
                    self.displayErrorMessage("There was an error with accessing the camera stream: " + err.name);
                }
            );
        }
        // this will call the getOutputs method.
        this._notifyOutputChanged();

    }

    public TakePhotoClicked(evt: Event): void {
        debugger;
        this.takeSnapshot();
        var snap = this._canvasDataURL;

        // Show image.        
        this._SnapImage.setAttribute('src', snap);
        this._SnapImage.classList.add("visible");
                        
        // Pause video playback of stream.
        this._VideoCameraStream.pause();
        
        this._notifyOutputChanged();
    }

    public RetakePhotoClicked(evt: Event): void {
        debugger;      
        // Hide image.        
        this._SnapImage.setAttribute('src', '');
        this._SnapImage.classList.remove("visible");
        
        // Pause video playback of stream.
        this._VideoCameraStream.play();

        this._notifyOutputChanged();
    }


    public HidePhotoContainer(evt: Event): void {

        var self = this;
        self._VideoCameraStream.pause();
        self._VideoCameraStream.src = "";        
        self._VideoCameraStream.srcObject = null;
        self.HideUI();
        self._notifyOutputChanged();
    }

}