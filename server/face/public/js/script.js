const video = document.getElementById('videoInput')
var att = '{"names":[' +
'{"name":"gowtham","count":0, "flag":"absent" },' +
'{"name":"sathya","count":0, "flag":"absent"},' +
'{"name":"sai","count":0, "flag":"absent" }]}';

obj = JSON.parse(att);
function cmt(){
    var cmt1=""
    for(let i=0;i<3;i++){
        cmt1=cmt1+obj.names[i].name + " " + obj.names[i].flag+"<br>"
    }
    return cmt1;
}

document.getElementById("visit").innerHTML =cmt();

Promise.all([
    
    faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models') //heavier/accurate version of tiny face detector
]).then(start)

function start() {
    document.body.append('Models Loaded')
    
    navigator.getUserMedia(
        { video:{} },
        stream => video.srcObject = stream,
        err => console.error(err)
    )
    
    //video.src = '../videos/speech.mp4'
    console.log('video added')
    recognizeFaces()
}

async function recognizeFaces() {

    const labeledDescriptors = await loadLabeledImages()
    console.log(labeledDescriptors)
    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.7)
    video.addEventListener('play', async () => {
        console.log("pause");
    });

    video.addEventListener('play', async () => {
        console.log('Playing')
        const canvas = faceapi.createCanvasFromMedia(video)
        document.body.append(canvas)
        

        const displaySize = { width: video.width, height: video.height }
        faceapi.matchDimensions(canvas, displaySize)

        

        setInterval(async () => {
            const detections = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors()

            const resizedDetections = faceapi.resizeResults(detections, displaySize)

            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)

            const results = resizedDetections.map((d) => {
                return faceMatcher.findBestMatch(d.descriptor)
            })
            results.forEach( (result, i) => {
                const box = resizedDetections[i].detection.box
                const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
                drawBox.draw(canvas)
                for(let i=0;i<3;i++){
                if(result.label==obj.names[i].name){
                    obj.names[i].count=obj.names[i].count+1;
                    
                document.getElementById("att").innerHTML=(result.label).toString()+':'+obj.names[i].count*2+'%'
                if(obj.names[i].count==50){
                    obj.names[i].flag="present";
                    obj.names[i].count=0;
                    console.log(obj.names[i].flag);
                    document.getElementById("visit").innerHTML=cmt(); 
                }
            }}
                //console.log((result.label).toString()+(g))
                //document.getElementById("att1").innerHTML=(result.label).toString()+(this.g).toString()
                
            })
        }, 100)


        
    })
}


function loadLabeledImages() {
    //const labels = ['Black Widow', 'Captain America', 'Hawkeye' , 'Jim Rhodes', 'Tony Stark', 'Thor', 'Captain Marvel']
    const labels = ['gowtham','sai','yogesh','sathya','surya']// for WebCam
    const year='final'
    
    return Promise.all(
        labels.map(async (label)=>{
            const descriptions = []
            for(let i=1; i<=2; i++) {
                const img = await faceapi.fetchImage(`../${year}/${label}/${i}.jpg`)
                const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
                console.log(label + i + JSON.stringify(detections))
                descriptions.push(detections.descriptor)
            } 
            document.body.append(label+' Faces Loaded | ')
            return new faceapi.LabeledFaceDescriptors(label, descriptions)
        })
    )
}