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
    // Modal DOM variables
    const sectionModal = document.querySelector('.section-modal')
    const modalTaskName = document.querySelector('.modal-task-name')
    const modalTaskIndex = document.querySelector('.modal-row-index')
    const closeModal = document.querySelector('.close-modal')
    const modalTaskAnswer = document.querySelector('.modal-task-answer')
    const modalStatusAnswer = document.querySelector('.modal-status-answer')
    const modalTextAnswer = document.querySelector('.modal-text-answer')
    const modalDateAnswer = document.querySelector('.modal-date-answer')
    const modalCompletedBy = document.querySelector(".modal-completed-by-answer")
    const modalShiftName = document.querySelector(".modal-shift-name")
    // help text section
    const helpSection = document.querySelector(".help-section")
    const helpText = document.querySelector('#help-text')
    const copyBtn = document.querySelector('.copy-text')
    const copied = document.querySelector('#copied')
    const copy = document.querySelector('#copy')
    // loader
    const loader = document.getElementById('loader-wrapper')


    const missingTreshold = 10; // variable to hold a treshold for allowed % of missing tasks

    // store details :
    const storeDetailsObj = {
        storeName: '',
        storeNumber: ''
    }

    // this variables is to store VALUE of the limit for given task
    let enteredValueLimit;
    let enteredMinTempValue;

    // it is variable to hold value if answer to question is Yes
    let isYesAnswer = false;

    // this variable is to store TYPE of the limit for given task
    let typeOfTheLimit;

    // variable holding all the data from excel file
    let myData;

    // this variable will hold name of selected task globally
    let globalTaskName = '';

    // first date in the Excel spreadsheet - is will be most current date
    let firstDateOnSpreadsheet; 

    // current shift date in the Excel spreadsheet - is will be date at current index in the loop
    let currentShiftDate;

    // difference between two dates. This is to help determine how many days we check each task
    let daysDifference = 0

    // setting max number of characters we want to display for each question
    let screen_w = window.innerWidth;
    let strCount = 80; // 80 would be default value

    if (screen_w >= 1200) {
        strCount = 80;
    } else if (screen_w > 600 && screen_w < 1200) {
        strCount = 40;
    } else {
        strCount = 20;
    }

    // string replacing undefined or empty string as answer to question
    const answerToEmptyString = 'Check missed'
 
    //this is variable to count missed tasks (need this value for help text)
    let countMissedTask = 0 

    

   // object with Hutbot questions we have to check - value in SELECT will correspond to one of the key values

   const questionsObj = {

    q1: {
        q: "Check the temperature of hot water at a non-handwash sink (should be a minimum of 49⁰C /120⁰F)",
        limit: 49,
        minTemp: '',
        shortStr: 'Hot water temp check',
        type: 'hot',
        isYesNoQuestion: false,
        missed: 0,
        incorrect: 0,
        helpingACEText: function() {
            if(this.missed < 2) {
                return `There are ${this.incorrect} temps entered which fall outside the range with no corrective action recorded for ${this.shortStr}`
            } else if(this.incorrect < 2) {
                return `There are ${this.missed} temps missed with no corrective action recorded for ${this.shortStr}`
            } else {
                return `There are ${this.missed} temps missed and ${this.incorrect} fall outside range with no corrective action recorded for ${this.shortStr}`
            }   
        }
    },
    q2: {
        q: "Record the temperature of the walk-in Freezer.",
        limit: -13,
        minTemp: -23,
        shortStr: 'walk-in-freezer temp check',
        type: 'cold',
        isYesNoQuestion: false,
        missed: 0,
        incorrect: 0,
        helpingACEText: function() {
            if(this.missed < 2) {
                return `There are ${this.incorrect} temps entered which fall outside the range with no corrective action recorded for ${this.shortStr}`
            } else if(this.incorrect < 2) {
                return `There are ${this.missed} temps missed with no corrective action recorded for ${this.shortStr}`
            } else {
                return `There are ${this.missed} temps missed and ${this.incorrect} fall outside range with no corrective action recorded for ${this.shortStr}`
            }    
        }
    },
    q3: {
        q: "Record the temperature of the walk-in fridge.",
        limit: 5,
        minTemp: 0,
        shortStr: 'walk-in-fridge temp check',
        type: 'cold',
        isYesNoQuestion: false,
        missed: 0,
        incorrect: 0,
        helpingACEText: function() {
            if(this.missed < 2) {
                return `There are ${this.incorrect} temps entered which fall outside the range with no corrective action recorded for ${this.shortStr}`
            } else if(this.incorrect < 2) {
                return `There are ${this.missed} temps missed with no corrective action recorded for ${this.shortStr}`
            } else {
                return `There are ${this.missed} temps missed and ${this.incorrect} fall outside range with no corrective action recorded for ${this.shortStr}`
            }    
        }
    },
    q4: {
        q: "Mark yes if you completed your weekly fire safety test and use the comment box to record the call point",
        limit: '',
        shortStr: 'Fire safety point test',
        type: '',
        isYesNoQuestion: true,
        missed: 0,
        incorrect: 0,
        helpingACEText: function() {
           return `The team have recorded that fire point has been checked but ${this.missed} times missed to record which fire point has been checked.`  
        }
    },
    q5: {
        q: "Record the names of any visitors to your Hut during your shift",
        limit: '',
        shortStr: 'Visitors record',
        type: '',
        isYesNoQuestion: true,
        missed: 0,
        incorrect: 0,
        helpingACEText: function() {
           return `Visitors names have not been logged on ${this.missed} occasion when answered Yes`  
        }
    },
    q6: {
        q: "Record the temperature of the Freezer.",
        limit: -13,
        minTemp: -23,
        shortStr: 'Freezers temp check',
        type: 'cold',
        isYesNoQuestion: false,
        missed: 0,
        incorrect: 0,
        helpingACEText: function() {
            if(this.missed < 2) {
                return `There are ${this.incorrect} temps entered which fall outside the range with no corrective action recorded for ${this.shortStr}`
            } else if(this.incorrect < 2) {
                return `There are ${this.missed} temps missed with no corrective action recorded for ${this.shortStr}`
            } else {
                return `There are ${this.missed} temps missed and ${this.incorrect} fall outside range with no corrective action recorded for ${this.shortStr}`
            }    
        }
    },

    q7: {
        q: "Record the temperature of the fridge.",
        limit: 5,
        minTemp: 0,
        shortStr: 'Fridges temp check',
        type: 'cold',
        isYesNoQuestion: false,
        missed: 0,
        incorrect: 0,
        helpingACEText: function() {
            if(this.missed < 2) {
                return `There are ${this.incorrect} temps entered which fall outside the range with no corrective action recorded for ${this.shortStr}`
            } else if(this.incorrect < 2) {
                return `There are ${this.missed} temps missed with no corrective action recorded for ${this.shortStr}`
            } else {
                return `There are ${this.missed} temps missed and ${this.incorrect} fall outside range with no corrective action recorded for ${this.shortStr}`
            }    
        }
    },

    q8: {
        q: "Upon receiving the stock order delivery, check and record the fresh product temperatures using a calibrated thermometer",
        limit: 5,
        minTemp: 0,
        shortStr: 'delivery checks for fresh product',
        type: 'cold',
        isYesNoQuestion: false,
        missed: 0,
        incorrect: 0,
        helpingACEText: function() {
            if(this.missed < 1) {
                return `There are ${this.incorrect} temps entered which fall outside the range with no corrective action recorded for ${this.shortStr}`
            } else if(this.incorrect < 1) {
                return `There are ${this.missed} temps missed with no corrective action recorded for ${this.shortStr}`
            } else {
                return `There are ${this.missed} temps missed and ${this.incorrect} fall outside range with no corrective action recorded for ${this.shortStr}`
            }    
        }
    },

    q9: {
        q: "Upon receiving the stock order delivery, check and record the frozen product temperatures using a calibrated thermometer",
        limit: -13,
        minTemp: -23,
        shortStr: 'delivery checks for frozen product',
        type: 'cold',
        isYesNoQuestion: false,
        missed: 0,
        incorrect: 0,
        helpingACEText: function() {
            if(this.missed < 1) {
                return `There are ${this.incorrect} temps entered which fall outside the range with no corrective action recorded for ${this.shortStr}`
            } else if(this.incorrect < 1) {
                return `There are ${this.missed} temps missed with no corrective action recorded for ${this.shortStr}`
            } else {
                return `There are ${this.missed} temps missed and ${this.incorrect} fall outside range with no corrective action recorded for ${this.shortStr}`
            }    
        }
    },

    minNumberDays: 7,
    maxNumberDays: 28,
}

    // Object with error messages
    const errorsMsg = {
        selectFile: "Please select excel file first",
        selectTask: "Please select question or task from dropdown list",
        delateTab: "Please delate Report sheet in selected Excel file. It's causing issues with data download.",
        missingTabs: "Something went wrong. Please ensure you are checking valid Hutbot file.",
        noRecords: 'Could not find any records for this question',
        noDeliveryFresh: 'In last 7 days checked, there is no record of temp check for delivery of fresh products',
        noDeliveryFrozen: 'In last 7 days checked, there is no record of temp check for delivery of frozen products',
    }

    //Listening for click on the 'GET INFO' button
    btn.addEventListener('click', (e) => {
        e.preventDefault()

        // display loader
        displayLoader(loader, 1500)

        //firstly, hide error message paragraph if any error is displayed
        hideEl(errorDisplay)
        hideEl(helpSection)

        let typeOfRoutine = ''
        //it will check if task selected and then if selected, it will get its value
        const task = checkSelectOption(selectedTask)
        console.log(task)

         // assign current task name to its global variable
         globalTaskName = task;

        //  TODO: We can add typeOfRoutine to object as one of the keys
        //if selected tasks is one of the YesNo questions, it will return typeOfRoutine = question, otherwise it will be a task
        if (task[0] === 'q') {
            typeOfRoutine = 'question'
        } else {
            typeOfRoutine = 'task'
        }

        //getting our question based on user selection
        // const selectedQuestion = convertQuestion(task).question
        const selectedQuestion = convertQuestion(task).q
       
        //find out is there is any limit and minimum temp assigned to it
        enteredValueLimit = convertQuestion(task).limit
        enteredMinTempValue = convertQuestion(task).minTemp

        console.log(`limit: ${enteredValueLimit}`)
        console.log(`Min temp: ${enteredMinTempValue}`)
        
        //find out if there is any limit type assigned to it
        typeOfTheLimit = convertQuestion(task).type
        console.log(`Type of the limit: ${typeOfTheLimit}`)

        //find out if answer to question is Yes or No
        isYesAnswer = convertQuestion(task).isYesNoQuestion

        // check if we have any file uploaded
        const inputVal = fileInput[0].value

        //clear the answers list for new file upload
        answersList.innerHTML = ''

        if(inputVal) {
            console.log(`Currently uploaded file is ${inputVal}`)

            // if this is a task, we would look for task in uploaded file
            if (typeOfRoutine === 'task') {

                const taskCount = countTask(myData, selectedQuestion)

                // if there is not record, display error message, otherwise display fetched information
                if(taskCount === 0) {
                     // if file is not selected, it will display error message
                     displayError(errorDisplay, errorsMsg.noRecords)
                } else {
                    //this will display info bar with task count and % of missing checks
                    insertMissingPercent(missedSection, taskCount)

                    if (taskCount.percent > 10) {
                        missedTaskText(taskCount.percent, selectedQuestion)
                        showEl(helpSection)
                    }

                    console.log('We are in tasks part')
                    console.log(`NUmber of ${task} task is ${taskCount.count}, missed are ${taskCount.missed} which is ${taskCount.percent}%` )
                }
            } else {
                const taskCount = countRoutines(myData, selectedQuestion, isYesAnswer)
                // Hide missingSection - we do not need it here
                hideEl(missedSection)

                // if there is not record, display error message, otherwise display fetched information
                if(taskCount === 0) {

                    // TODO: Change hard coded q8 and q9 to something more dynamic
                    //when selected question is about fresh or frozen delivery, display this message
                    if(task === 'q8') {
                        // if delivery checks for fresh products is not completed, it will display error message
                        displayError(errorDisplay, errorsMsg.noDeliveryFresh)
                        helpingACETextDeliveries(errorsMsg.noDeliveryFresh)
                        showEl(helpSection)
                    } else if(task === 'q9') {
                        // if delivery checks for frozen products is not completed, it will display error message
                        displayError(errorDisplay, errorsMsg.noDeliveryFrozen)
                        helpingACETextDeliveries(errorsMsg.noDeliveryFrozen)
                        showEl(helpSection)
                    } else {
                        // if file is not selected, it will display error message
                        displayError(errorDisplay, errorsMsg.noRecords)
                    }
                     
                } else {
                    console.log('We are in questions part')
                    console.log(`Number of ${task} task is ${taskCount}` )
                    console.log(enteredValueLimit)
                }
                
                
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

        // display loader
        displayLoader(loader, 1000)

        //clear the answers list for new file upload and store details
        answersList.innerHTML = ''
        // display default store details
        displayStoreDetails()

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


    //event listener for click on any of the task list li, to display task detail in modal.
    answersList.addEventListener('click', (e) => {


        const rowID = e.target.id
        console.log(rowID)
        displayTaskDetailsModal(rowID, myData)
    })

    // Close modal event listener
    closeModal.addEventListener('click', () => {

        sectionModal.style.display = 'none'
    })

    // listening for copy button click to copy help text
    copyBtn.addEventListener('click', ()=> {
        copyToClipBoard()
        getDelayedInfo(copied, copy, 2000)
    })

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

     // function to show any given element
     const showEl = (el) => {
        el.style.display = 'block'
    }

    // This function will count how many times given routine occured
    const countRoutines = (obj, routineName, isYesNo) => {
        let count = 0 //counter of routines
        let answer;  // this variable holding answer to the question
        let text;    // this is variable holding text (if any) for given question 
        let shiftDate;  //shift date
        let convertedDate;  // date after conversion from Excel to JS
        let countIncorrect = 0; //this is variable to count incorrect values with no actions
        let newLi; // this is variable which will hold new <li>
        
        // reset it to ZERO, ensuring each task start with "clean sheet"
        countMissedTask = 0;

        // get the first date in spreadsheet and then convert it to JS date format
        firstDateOnSpreadsheet = getDate(obj)
        

        //counting how many times this particular routine has been completed
        for(let i = 0; i < obj.length; i++) {

            let currQuestionName = obj[i]['Question Name']
            let doesInclude = currQuestionName.includes(routineName)

            // this will get date of current shift date and convert it to JS date format
            currentShiftDate = getDate(obj, i)

            // calculate days difference between first date on the spreadsheet (most current one) with date on currentShiftDate date at i counter
            daysDifference = calcNumberOfDays(firstDateOnSpreadsheet, currentShiftDate)

            // if(obj[i]['Question Name'] === routineName) { 
            if(doesInclude) {

                // it will only count task for defined number of days - minNumberDays in this function
                if(daysDifference < questionsObj.minNumberDays) {
                    answer = obj[i]['Question Answer']
                    text = obj[i]['Question Text']
                    console.log(`Days difference is: ${daysDifference}`)
                    if(!text) text = "No"
                        shiftDate = obj[i]['Shift Date']
                        convertedDate = excelDateToJSDate(shiftDate)

                        // check if we have UNDEFINED answer. If we have, it will return Missed check, otherwise it will returned entered value
                        if(isYesNo === true) {
                            // TODO: Do something when it is TRUE for YesNo answers question
                             // This need to be re-factored
                                if(answer === 'Yes') {
                                     count++

                                    newLi = document.createElement('li')

                                    // checking if store is entering correct value, base on its limit
                                    const validValue =  checkLimit(answer, enteredValueLimit, enteredMinTempValue, typeOfTheLimit)
                                    console.log(`Type of the limit second check: ${typeOfTheLimit}`)
                    
                                    newLi.innerHTML = `<span class="answer answer--text">${count}. Routine completed on: ${convertedDate}</span><div class="answer-wrapper"><span class="answer answer--value">${answer},</span><span class="answer answer--value"> Name recorded?   ${text}<i class="bx bx-edit edit-icon" id="${i}"></i></span></div>`
                    
                                    if (text === 'No') {
                                         newLi.classList.add('incorrect-value')
                                        // count incorrect answers without an action
                                        if(text === 'No') countIncorrect++
                                    }

                                // if user missed the answer or entered incorrect one, highlight it
                                if(answer === answerToEmptyString) {
                                 newLi.classList.add('incorrect-value')
                                }

                                     answersList.appendChild(newLi)
                                }
                        } else {
                            answer = checkIfUndefinedAnswer(answer)

                            count++
                            console.log(`${count}: date: ${convertedDate}, answer: ${answer}`)
                            newLi = document.createElement('li')

                             // checking if store is entering correct value, base on its limit
                            const validValue =  checkLimit(answer,enteredValueLimit, enteredMinTempValue, typeOfTheLimit)
                            console.log(validValue)
                
                            newLi.innerHTML = `<span class="answer answer--text">${count}.  Routine completed on: ${convertedDate}</span><div class="answer-wrapper"><span class="answer answer--value">${answer},</span><span class="answer answer--value"> Action taken?   ${text}<i class="bx bx-edit edit-icon" id="${i}"></i></span></div>`
                
                            if (validValue === 'incorrect') {
                                newLi.classList.add('incorrect-value')
                            // count incorrect answers without an action
                                if(text === 'No') countIncorrect++
                                
                            }

                            // if user missed the answer or entered incorrect one, highlight it
                            if(answer === answerToEmptyString) {
                                newLi.classList.add('incorrect-value')
                            }

                            answersList.appendChild(newLi)
                        }
                
                }
                
            }
        }

        // set the incorrect value for selected task/question
        questionsObj[globalTaskName].incorrect = countIncorrect

        // set the incorrect value for selected task/question
        questionsObj[globalTaskName].missed = countMissedTask

        console.log(`print missed tasks in object: ${questionsObj[globalTaskName].missed }, variable: ${countMissedTask}`)
        console.log(`print incorrect tasks in object: ${questionsObj[globalTaskName].incorrect }, variable: ${countIncorrect}`)

        //run the helpingACEText() method to get correct help text
        const ACEText = questionsObj[globalTaskName].helpingACEText()

        //display this text in textarea
        if(countIncorrect >= 2 || countMissedTask >= 2) {
            helpingACEText(ACEText, countIncorrect, countMissedTask)
            showEl(helpSection)
        }
        

        return count;
    }

// Function checking how many times given task ocurred
    const countTask = (obj, taskName) => {
        let countTotal = 0; //variable to hold total number of completed tasks
        let countMissed = 0; //variable to hold total number of missed tasks
        let missedPercent = 0; //variable to hold % of missed tasks
        let questionName = '';  //This variable will hold name of current task
        let questionAnswer = '';  //This variable will hold answer given in Hutbot


         // get the first date in spreadsheet and then convert it to JS date format
         firstDateOnSpreadsheet = getDate(obj)

        //loop counting number of tasks
        for(let i = 0; i < obj.length; i++) {

            // this will get date of current shift date and convert it to JS date format
            currentShiftDate = getDate(obj, i)

            // calculate days difference between first date on the spreadsheet (most current one) with date on currentShiftDate date at i counter
            daysDifference = calcNumberOfDays(firstDateOnSpreadsheet, currentShiftDate)

            if(obj[i]['Tab Name'] === taskName) {

                // check if it is within max numbers of days we check this routine for 
                if(daysDifference < questionsObj.maxNumberDays) {
                    //counting total number of tasks
                    countTotal++
                    if(obj[i]['Routine Status'] === 'MISSED') {
                        //counting number of missed ones
                        countMissed++
                    
                    }

                    questionName = obj[i]['Question Name']
                    // trim the question to limited number of characters
                    questionName = trimString(questionName, strCount)

                    questionAnswer = obj[i]['Question Answer']

                    // check if we have UNDEFINED answer. If we have, it will return Missed check, otherwise it will returned entered value
                    questionAnswer = checkIfUndefinedAnswer(questionAnswer)

                    // Adding new <li> element into DOM
                    const newLi = document.createElement('li')
                    newLi.innerHTML = `<span class="answer-text">${questionName} </span><span class="answer">${questionAnswer}<i class="bx bx-edit edit-icon" id="${i}"></i></span>`
               
                    // if user missed the answer or entered incorrect one, highlight it
                    if(questionAnswer === answerToEmptyString) {
                        newLi.classList.add('incorrect-value')
                    }

                    answersList.appendChild(newLi)
                }
                
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


    // TODO: This could be changed to loop and see if selected option is in question object
    //function converting SELECT value into a question
    const convertQuestion = (questionVal) => {
        switch (questionVal) {
            case 'q1':
                return questionsObj.q1
            case 'q2':
                return questionsObj.q2
            case 'q3':
                return questionsObj.q3
            case 'q4':
                return questionsObj.q4
            case 'q5':
                return questionsObj.q5
            case 'q6':
                return questionsObj.q6
            case 'q7':
                return questionsObj.q7
            case 'q8':
                return questionsObj.q8
            case 'q9':
                return questionsObj.q9
            default:
                return {
                    q: questionVal,
                    limit: '',
                    type: '',
                    isYesNoQuestion: false
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

    // function highlighting tasks which were not completed (empty or counted as undefined)
    const markUndefined = (el) => {

        if(el.innerText === answerToEmptyString) {
            el.classList.remove('green-section')
            el.classList.add('red-section')
        }

    }

    // if val is undefined, return str (empty string by default), otherwise return val
    const replaceUndefined = (val, str = '') => {
        if(val) {
            return val
        } else {
            return str
        }
    }

    // function which check if entered value is below required limit
    const checkLimit = (currentVal, limitVal,minVal,limitType) => {
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
            if(currentVal > limitVal || currentVal < minVal) {
                console.log(`Current value: ${currentVal}, limit: ${limitVal}, Min temp: ${minVal}, Limit type:  ${limitType}`)
                return 'incorrect'
            } else {
               
                return 'correct'
            }
        } else {
            console.log(`Current value: ${currentVal}, limit: ${limitVal}, Min temp: ${minVal}, Limit type:  ${limitType}`)
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


     // function to display modal with task details
     const displayTaskDetailsModal = (index, obj) => {
        // it will only work when passed index is a number.
        if(index) {
            // take the date and time when this task was completed
            const completionDate = obj[index]['Shift Date']
            let answer = obj[index]['Question Answer']

            // checks of empty of undefined and then convert if it is
            answer = checkIfUndefinedAnswer(answer)

            //then change its format to JS date if date is entered
            if(completionDate) {

                const formattedDate = excelDateToJSDate(completionDate)
                const dateString = new Date(formattedDate);
                const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'};
                modalDateAnswer.innerText = dateString.toLocaleDateString('en-us', options)
            } else {
                modalDateAnswer.innerText = ''
            }
            // status variable
            const status = obj[index]['Routine Status']
            sectionModal.style.display = 'block'
            modalTaskIndex.innerText = index
            modalTaskName.innerText = obj[index]['Question Name']

            modalTaskAnswer.innerText = answer
            modalStatusAnswer.innerText = status
            modalTextAnswer.innerText = obj[index]['Question Text']

            // get the name of shift leader, if undefined, replace it with 
            let shiftLead = obj[index]['Shift Lead']
            if(shiftLead) {
                replaceUndefined(shiftLead, 'No name')
            } else {
                shiftLead = 'No name'
            }
            
            modalCompletedBy.innerText = shiftLead
            // this typically would ne Morning or Evening
            modalShiftName.innerHTML = `${obj[index]['Shift Name']} shift`

            if(answer === answerToEmptyString) {
                modalTaskAnswer.style.color = 'red'
            } else {
                modalTaskAnswer.style.color = 'white'
            }

            // Adding color to the status, Green - on time, orange - late. Red for missed
            if(status === 'ON TIME') {
                modalStatusAnswer.style.color = 'green'
            } else if(status === 'LATE') {
                modalStatusAnswer.style.color = 'orange'
            } else if(status === 'MISSED') {
                modalStatusAnswer.style.color = 'red'
            } else {
                modalStatusAnswer.style.color = 'white'
            }

        } else {
            console.log('You must clicked something else')
        }

    }


    // function to reduce number of characters if it's too long
    const trimString = (text, count) => {

        if (text.length > count) {
            return text.slice(0,count) + ' ...'
        } else {
            return text
        }
    }


    // function to copy text to clipboard
    const copyToClipBoard = () => {
        helpText.select();
        document.execCommand('copy');
        // alert("Copied!");
    }

    //function to add correct text we can copy to ACE tool in case task is missed or entered incorrectly
    const helpingACEText = (str, incorrectVal = 0,countMissedTask = 0) => {

        if(incorrectVal >= 2 || countMissedTask >= 2) {
            helpText.innerText = str
        } else {
            helpText.innerText = 'All good for this one'
        }
    }

    const helpingACETextDeliveries = (str) => {
        helpText.innerText = str
    }

    // function to deal with undefined answer
    const checkIfUndefinedAnswer = (answer) => {
        if(answer) {
            return answer
        } else {
            // increase value of undefined/missed tasks
            countMissedTask++;
            //return string assigned to replace undefined
            return answerToEmptyString
        }
    }


    // function to displayed delayed item (with use of setTimeout)
    const getDelayedInfo = (elShow, elHide, delayTime) => {
        setTimeout(() => {
            elShow.style.display = 'none'
            elHide.style.display = 'block'
            
        }, delayTime)

        elShow.style.display = 'block'
        elHide.style.display = 'none'
    }

    //function to add help text to missed tasks only
    const missedTaskText = (missedNumber, task) => {
        const str = `In last 4 weeks checked in Hutbot, store missed ${missedNumber}% of ${task} checks.`
        helpText.innerText = str
    }

    // function to display loader 
    const displayLoader = (loaderEl, delayTime) => {
        setTimeout(() => {
            loaderEl.style.display = 'none'
            
        }, delayTime)

        loaderEl.style.display = 'block'
    }

    const calcNumberOfDays = (dateStart, dateFinish) => {
        // To set two dates to two variables
        // first date would be a first date on the spreadsheet, and it will be the most current one 
        const firstDate = new Date(dateStart);
        const currentDate = new Date(dateFinish);
      
        // To calculate the time difference of two dates
        const difference_In_Time = firstDate.getTime() - currentDate.getTime();
      
        // To calculate the no. of days between two dates
        const difference_In_Days = difference_In_Time / (1000 * 3600 * 24);

        return difference_In_Days
    }

    // function to get the first date in spreadsheet and then convert it to JS date format
    const getDate = (obj, i = 0) =>  {
        let myDate = obj[i]['Shift Date']
        myDate = excelDateToJSDate(myDate)
        return myDate
    }
    

});
