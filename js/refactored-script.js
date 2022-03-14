$(document).ready(function() {

    // DOM elements selectors
    const btn = document.querySelector('.btn')
    const fileInput = $('#file')
    const answersList = document.querySelector('.answers-list')
    const selectedTask = document.querySelector('#questions')
    const errorDisplay = document.querySelector('.error-msg')
    const countTotal = document.getElementById('count-total')
    const countMissed = document.getElementById('count-missed')
    const calcMissedPercent = document.getElementById('missed-percent')
    const missedSection = document.querySelector('.missed-tasks-section')
    const storeDetails = document.querySelector('.store-details')

    const missingTreshold = 10; // variable to hold a treshold for allowed % of missing tasks

    // store details :
    const storeDetailsObj = {
        storeName: '',
        storeNumber: ''
    }

    // this variable is to store VALUE of the limit for given task
    let enteredValueLimit;

    // this variable is to store TYPE of the limit for given task
    let typeOfTheLimit;

    // variable holding all the data from excel file
    let myData;

    // object with Hutbot questions we have to check - value in SELECT will correspond to arrey index
    const questions = {
        q1: "Check the temperature of hot water at a non-handwash sink.",
        q1_limit: 49,
        q1_type: 'hot',
        q2: "Record the temperature of the walk-in Freezer.",
        q2_limit: -15,
        q2_type: 'cold',
        q3: "Record the temperature of the walk-in fridge.",
        q3_limit: 5,
        q3_type: 'cold',
        q4: "Mark yes if you completed your weekly fire safety test and use the comment box to record the call point",
        q5: "Record the names of any visitors to your Hut during your shift"
    }
    

    // Object with error messages
    const errorsMsg = {
        selectFile: "Please select excel file first",
        selectTask: "Please select question or task from dropdown list",
        delateTab: "Please delate Report tag in your Excel file. It is causing download data issue.",
        missingTabs: "Something went wrong. Please ensure you are checking valid Hutbot file.",
    }

    //Listening for click on the 'GET INFO' button
    btn.addEventListener('click', (e) => {
        e.preventDefault = true

        //firstly, hide error message paragraph if any error is displayed
        hideEl(errorDisplay)

        let typeOfRoutine = ''
        //it will check if task selected and then if selected, it will get its value
        const task = checkSelectOption(selectedTask)
        console.log(task)

        //if selected tasks is one of the YesNo qestions, it will return typeOfRoutine = question, otherwise it will be a task
        if (task[0] === 'q') {
            typeOfRoutine = 'question'
        } else {
            typeOfRoutine = 'task'
        }

        //getting our question based on user selection
        const selectedQuestion = convertQuestion(task).question
        //find out is there is any limit assigned to it
        enteredValueLimit = convertQuestion(task).limit
        //find out is there is any limit type assigned to it
        typeOfTheLimit = convertQuestion(task).type
        const inputVal = fileInput[0].value

        //clear the answers list for new file upload
        answersList.innerHTML = ''

        if(inputVal) {
            console.log(`Currenty uploaded file is ${inputVal}`)

            // if this is a task, we would look for task in uploaded file
            if (typeOfRoutine === 'task') {

                const taskCount = countTask(myData, selectedQuestion)

                insertMissingPercent(missedSection, taskCount)
                console.log('We are in tasks part')
                console.log(`NUmber of ${task} task is ${taskCount.count}, missed are ${taskCount.missed} which is ${taskCount.percent}%` )
            } else {
                const taskCount = countRoutines(myData, selectedQuestion)
                // Hide missingSection - we do not need it here
                hideEl(missedSection)
                
                console.log('We are in questions part')
                console.log(`NUmber of ${task} task is ${taskCount}` )
                console.log(enteredValueLimit)
            }

        } else {
           // if file is not selected, it will display error message
           displayError(errorDisplay, errorsMsg.selectFile)
        }
    })

    // If there any error messages, clicking on FILE input will hide that error message
    fileInput.on('click', ()=> {
        hideEl(errorDisplay)
    })

    // We listen for any change in file input, and when it change we read the file and saving data in myData variable
    fileInput.change(function(evt) {

        //clear the answers list for new file upload
        answersList.innerHTML = ''

        //hide missed section as well
        hideEl(missedSection)

        const selectedFile = evt.target.files[0];
        const reader = new FileReader();
        reader.onload = function(event) {
            const data = event.target.result;
            
            const workbook = XLSX.read(data, {
                type: 'binary'
            });

             // we only need to check values in first sheet
                const sheetName = workbook.SheetNames[0]
                const numOfSheets = workbook.SheetNames.length
                if(numOfSheets > 1) { 
                    // if is more than one sheet, it will display error message
                    displayError(errorDisplay, errorsMsg.delateTab)
                    // reset store display message to its default values
                    displayStoreDetails()
                } else {
                    if(sheetName) {
                        let XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
                        let json_object = JSON.stringify(XL_row_object)
    
                        myData = JSON.parse(json_object)
                        storeDetailsObj.storeName = myData[0]['Store Name']
                        storeDetailsObj.storeNumber = myData[0]['Local Store Number']
                        console.log(myData)
                        displayStoreDetails(storeDetailsObj.storeName, storeDetailsObj.storeNumber)
                    } else {
                        // if something goes wrong, we will display this message
                        displayError(errorDisplay, errorsMsg.missingTabs)
                    }
                }
        };

        reader.onerror = function(event) {
            console.log("File can not be read. Code: ", event.target.error.code)
            displayError(errorDisplay, event.target.error.code )
        }

        reader.readAsBinaryString(selectedFile)

    });


    // FUNCTIONS

    // function displaying error message 
    const displayError = (el, msg) => {
        el.style.display = 'block'
        el.innerText = msg
    }

    // function hiding error messages
    const hideEl = (el) => {
        el.style.display = 'none'
    }

    // This function will count how many times given routine occured
    const countRoutines = (obj, routineName) => {
        let count = 0 //counter of routines
        let answer;  // this variable holding answer to the question
        let text;    // this is variable holding text (if any) for given question 
        let shiftDate;  //shift date
        let convertedDate;  // date after conversion from Excel to JS
        //counting how many times this particular routine has been completed
        for(let i = 0; i < obj.length; i++) {
            if(obj[i]['Question Name'] === routineName) {
                answer = obj[i]['Question Answer']
                text = obj[i]['Question Text']
                if(!text) text = "No"
                shiftDate = obj[i]['Shift Date']
                convertedDate = excelDateToJSDate(shiftDate)

                count++
                console.log(`${count}: date: ${convertedDate}, answer: ${answer}`)
                const newLi = document.createElement('li')
                // checking if store is entering correct value, base on its limit
                const validValue =  checkLimit(answer,enteredValueLimit, typeOfTheLimit)
                
                newLi.innerHTML = `<span class="answer answer--text">${count}: Routine completed on: ${convertedDate}</span><div class="answer-wrapper"><span class="answer answer--value">${answer}</span><span class="answer answer--value">, Action taken?  ${text}</span></div>`
                
                if (validValue === 'incorrect') {
                    newLi.classList.add('incorrect-value')
                }
                answersList.appendChild(newLi)
            }
        }

        return count;
    }

// Function checking how many times given taks accured
    const countTask = (obj, taskName) => {
        let countTotal = 0; //variable to hold total number of completed tasks
        let countMissed = 0; //variable to hold total number of missed tasks
        let missedPercent = 0; //variable to hold % of missed tasks
        let questionName = '';  //This variable will hold name of current task
        let questionAnswer = '';  //This variable will hold answer given in Hutbot
        //loop counting number of tasks
        for(let i = 0; i < obj.length; i++) {
            if(obj[i]['Tab Name'] === taskName) {
                //counting total number of tasks
                countTotal++
                if(obj[i]['Routine Status'] === 'MISSED') {
                    //counting number of missed ones
                    countMissed++
                    
                }
                questionName = obj[i]['Question Name']
                questionAnswer = obj[i]['Question Answer']

                // Adding new <li> element into DOM
                const newLi = document.createElement('li')
                newLi.innerHTML = `<span class="answer-text">${questionName}:</span><span class="answer">${questionAnswer}</span>`
                answersList.appendChild(newLi)
            }

        }

        // check missed %
        countTotal > 0 ? missedPercent = (countMissed / countTotal) * 100 : missedPercent = 0;
        missedPercent  = missedPercent.toFixed(2)
        return {
            count: countTotal,
            missed: countMissed,
            percent: missedPercent
        }
    }

    //function converting SELECT value into a question
    const convertQuestion = (questionVal) => {
        switch (questionVal) {
            case 'q1':
                return {
                    question: questions.q1,
                    limit: questions.q1_limit,
                    type: questions.q1_type,
                 }
            case 'q2':
                return {
                    question: questions.q2,
                    limit: questions.q2_limit,
                    type: questions.q2_type,
                 }
            case 'q3':
                return {
                    question: questions.q3,
                    limit: questions.q3_limit,
                    type: questions.q3_type
                 }
            case 'q4':
                return {
                    question: questions.q4,
                    limit: '',
                    type: '',
                 }
            case 'q5':
                return {
                    question: questions.q5,
                    limit: '',
                    type: '',
                 }
            default:
                return {
                    question: questionVal,
                    limit: '',
                    type: '',
                 }
        }
    }


      // function to convert excel date to normal js date  
      const excelDateToJSDate = (excelDate) => {
         const date = new Date(Math.round((excelDate - (25567 + 2)) * 86400 * 1000));
         const converted_date = date.toISOString().split('T')[0];
        return converted_date;
      }

    //   function checking if we selected any option in SELECT and what it was
      const checkSelectOption = (obj) => {
        if(!obj.value || obj.value === 'null') {
            // if task or routine is not selected, it will display error message
            displayError(errorDisplay, errorsMsg.selectTask)
        } else {
            //otherwise, it will return what was selected
            return obj.value
        }
        
    }

    // function filling in missing tasks info into DOM
    const insertMissingPercent = (el, obj) => {
        el.style.display = 'flex'

        countTotal.innerHTML = `Total: <b>${obj.count}</b>`
        countMissed.innerHTML = `Missed tasks: <b>${obj.missed}</b>`
        calcMissedPercent.innerHTML = `Percent of missed: <b>${obj.percent}%</b>`

        if(obj.percent >= missingTreshold) {
            el.classList.remove('green-section')
            el.classList.add('red-section')
        } else {
            el.classList.remove('red-section')
            el.classList.add('green-section')
        }

    }

    // function which check if entered value is below required limit
    const checkLimit = (currentVal, limitVal,limitType) => {
        currentVal = Number(currentVal)
        // currentVal = Math.abs(currentVal)
        // limitVal = Math.abs(limitVal)
        if(limitType === 'hot') {
            if(currentVal < limitVal) {
                return 'incorrect'
            } else {
                return 'correct'
            }
        } else if(limitType === 'cold') {
            if(currentVal > limitVal) {
                console.log(currentVal, limitVal, limitType)
                return 'incorrect'
            } else {
                return 'correct'
            }
        } else {
            return 'correct'
        }
    }

    // function to display store details
    const displayStoreDetails = (hutName = 'Store Name', hutNumber = '1234') => {
        storeDetails.innerText = `${hutName} - ${hutNumber}`
        if (hutName === 'Store Name') {
            storeDetails.classList.add('store-details--muted')
        } else {
            storeDetails.classList.remove('store-details--muted')
        }
    }

});