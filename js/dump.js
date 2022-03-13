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
