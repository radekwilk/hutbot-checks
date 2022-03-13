$(document).ready(function() {

    // DOM elements selectors
    const btn = document.querySelector('.btn')
    const fileInput = $('#file')
    const answersList = document.querySelector('.answers-list')
    const selectedTask = document.querySelector('#questions')

    let myData;


    const question1 = "Check the temperature of hot water at a non-handwash sink."
    const question2 = "Record the temperature of the walk-in Freezer."
    const question3 = "Record the temperature of the walk-in fridge."
    const question4 = "Mark yes if you completed your weekly fire safety test and use the comment box to record the call point"
    const question5 = "Record the names of any visitors to your Hut during your shift"


    // const myTxtFile = './files/questions.txt'

    // const myArr = getFile()


    btn.addEventListener('click', (e) => {
        e.preventDefault = true
        let typeOfRoutine = ''
        const task = checkSelectOption(selectedTask)
        console.log(task)

        if (task[0] === 'q') {
            typeOfRoutine = 'question'
        } else {
            typeOfRoutine = 'task'
        }

        const selectedQuestion = converQuestion(task)
        console.log(selectedQuestion)
        const inputVal = fileInput[0].value
        console.log(inputVal)
        answersList.innerHTML = ''
        if(inputVal) {
            console.log(`Currenty uploaded file is ${inputVal}`)

            // if this is a task, we would look for task in uploaded file
            if (typeOfRoutine === 'task') {

                const taskCount = countTask(myData, selectedQuestion)
                console.log('We are in taks part')
                console.log(`NUmber of ${task} task is ${taskCount.count}, missed are ${taskCount.missed} which is ${taskCount.percent}%` )
            } else {
                const taskCount = countRoutines(myData, selectedQuestion)
                console.log('We are in questions part')
                console.log(`NUmber of ${task} task is ${taskCount}` )
            }

        } else {
            answersList.innerText = 'YOu have to upload file to work with'
        }
    })

    const checkSelectOption = (obj) => {

        if(!obj.value || obj.value === 'null') {
            return 'Please select one of the task from the list'
        } else {

            return obj.value
        }
        
    }

    const selectedTaskVal = (task) => {

    }

    fileInput.change(function(evt) {
        const selectedFile = evt.target.files[0];
        const reader = new FileReader();
        reader.onload = function(event) {
            const data = event.target.result;
            
            const workbook = XLSX.read(data, {
                type: 'binary'
            });
            
            console.log(workbook)

            // we only need to check values in first sheet
            const sheetName = workbook.SheetNames[0]
            const numOfSheets = workbook.SheetNames.length
            console.log(sheetName)
            console.log(numOfSheets)
           if(sheetName) {
               let XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
               let json_object = JSON.stringify(XL_row_object)
   
               // console.log(json_object);
   
               // const myData = JSON.parse(json_object)
               myData = JSON.parse(json_object)
   
               console.log(myData)
               // const routineName = (myData[0]['Routine Name'])
               // countRoutines(myData, routineName)
               // console.log(myData.length)
               // const routineDueDate = (myData[0]['Routine Due Date'])
               // const convertedDate = excelDateToJSDate(routineDueDate)
               // console.log(convertedDate)
               // selectRange(myData, convertedDate, '2022-03-06')
           }
            
// ********************************************************************************************

            // workbook.SheetNames.forEach(function(sheetName) {

            // let XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
            // let json_object = JSON.stringify(XL_row_object)

            // console.log(json_object);

            // const myData = JSON.parse(json_object)
            // myData = JSON.parse(json_object)

            // console.log(myData)
            // const routineName = (myData[0]['Routine Name'])
            // countRoutines(myData, routineName)
            // console.log(myData.length)
            // const routineDueDate = (myData[0]['Routine Due Date'])
            // const convertedDate = excelDateToJSDate(routineDueDate)
            // console.log(convertedDate)
            // selectRange(myData, convertedDate, '2022-03-06')
            

            // })
        };

        reader.onerror = function(event) {
            console.log("File can not be read. Code: ", event.target.error.code)
        }

        reader.readAsBinaryString(selectedFile)

    });


    function countRoutines(obj, routineName) {
        let count = 0
        let answer;
        let shiftDate;
        let convertedDate;
        for(let i = 0; i < obj.length; i++) {
            if(obj[i]['Question Name'] === routineName) {
                answer = obj[i]['Question Answer']
                shiftDate = obj[i]['Shift Date']
                convertedDate = excelDateToJSDate(shiftDate)

                count++
                console.log(`${count}: date: ${convertedDate}, answer: ${answer}`)
                const newLi = document.createElement('li')
                newLi.innerHTML = `<span class="answer answer--text">${count}: ${convertedDate}</span><span class="answer answer--value">${answer}</span>`
                answersList.appendChild(newLi)
            }
        }

        return count;
    }

    const converQuestion = (questionVal) => {
        switch (questionVal) {
            case 'q1':
                return question1;
                break;
            case 'q2':
                return question2;
                break; 
            case 'q3':
                return question3;
                break;   
            case 'q4':
                return question4;
                break;
            case 'q5':
                return question5;
                break;
            default:
                return questionVal;
        }
    }


    function countTask(obj, taskName) {
        let countTotal = 0;
        let countMissed = 0;
        let missedPercent = 0;
        let questionName = ''
        let questionAnswer = ''
        for(let i = 0; i < obj.length; i++) {
            if(obj[i]['Tab Name'] === taskName) {
                // console.log(obj[i]['Routine Name'])
                countTotal++
                if(obj[i]['Routine Status'] === 'MISSED') {
                    // console.log(obj[i]['Routine Name'])
                    countMissed++
                    
                }
                questionName = obj[i]['Question Name']
                questionAnswer = obj[i]['Question Answer']
                console.log(questionName, questionAnswer)

                const newLi = document.createElement('li')
                newLi.innerHTML = `<span class="answer-text">${questionName}:</span><span class="answer">${questionAnswer}</span>`
                answersList.appendChild(newLi)
            }
        }

        // chack missed %
        countTotal > 0 ? missedPercent = (countMissed / countTotal) * 100 : missedPercent = 0;
        missedPercent  = missedPercent.toFixed(2)
        return {
            count: countTotal,
            missed: countMissed,
            percent: missedPercent
        }
    }

    // function to convert excel date to normal js date  
function excelDateToJSDate(excelDate) {
    const date = new Date(Math.round((excelDate - (25567 + 2)) * 86400 * 1000));
    const converted_date = date.toISOString().split('T')[0];
    return converted_date;
}

// function getFile(){
//     $.get(myTxtFile, function(textData, status) {
//         // console.log(textData)
//         var aLines = textData.split("\n");
    
//         // alert(textData + '\n'); 
//         console.log(aLines);
//         return aLines;
// });

// }

 
// const myArr = getFile()

});