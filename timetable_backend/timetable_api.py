from fastapi import FastAPI, UploadFile, File, Form, HTTPException  # type: ignore
from fastapi.responses import JSONResponse  # type: ignore
from typing import Optional
from docx import Document # type: ignore
import os

app = FastAPI()

DEFAULT_FILE_PATH = "default_timetable.docx"  # Default timetable file path

# Function to extract schedule from the Word document
def extract_schedule(doc_path, class_name):
    try:
        doc = Document(doc_path)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error opening document: {e}")

    time=True
    extracted_data = []
    for table in doc.tables:
        for row in table.rows:
            row_data = [cell.text.strip() for cell in row.cells]
            # adding new condition to get time row
            if time == True:
                if any(("classroom" or "day") in cell.replace(" ","").lower() for cell in row_data):
                     extracted_data.append(row_data)
                     time=False
            # this is the code to extract schedule
            if any(class_name.replace(" ","") in cell.replace(" ","").replace("\n","").lower() for cell in row_data):
                extracted_data.append(row_data)
    return extracted_data

# Function to process and return timetable data
def process_timetable(class_name, schedule):
    if not schedule:
        raise HTTPException(status_code=404, detail=f"No timetable found for {class_name}")

    data_lis = [""] * 15
    day_index = 0
    # time_lis = [
    #     "Day","8:00-8:50", "8:50-9:40", "9:40-10:30", "10:30-11:20", "11:20-12:10",
    #     "12:10-1:00", "1:00-1:45", "2:00-2:45", "2:45-3:30", "3:30:4:15",
    #     "4:15-5:00", "5:00-5:45", "5:45-6:30", "6:30-7:15"
    # ]
    
    mon = tue = wed = thu = fri = []

    for row_no, row in enumerate(schedule[1:], start=1):
        id = row[0]
        tr_id = {
            "Mon": "monday", "Tue": "tuesday", "Wed": "wednesday",
            "Thu": "thursday", "Fri": "friday"
        }.get(id, "holiday")

        cell_count = 1
        for cell in row:
            if cell_count == 1:
                day = cell
                data_lis[cell_count - 1] = f'{cell.replace("\n", "<br>")}'
            elif cell_count == 2:
                place = cell
            elif class_name.replace(" ","") in cell.replace(" ","").replace("\n","").lower():
                dot_index = cell.find(".")
                if dot_index != -1 and dot_index + 1 < len(cell) and cell[dot_index + 1] == " ":
                    cell = cell[:dot_index + 1] + cell[dot_index + 2:]
                if data_lis[cell_count - 2].__len__() >5:
                    data_lis[cell_count - 2] = f'{cell.replace("\n", "<br>").replace(class_name,"")}<br>{place}<br>LectureClash'
                else:
                    data_lis[cell_count - 2] = f'{cell.replace("\n", "<br>").replace(class_name,"")}<br>{place}'
            elif 'break' in cell.replace(" ","").lower() and data_lis[cell_count - 2].__len__()<=5:
                
                data_lis[cell_count - 2] = f'Break'
            elif cell_count == 8 and day in ["Wed", "Tue"]:
                data_lis[cell_count - 2] = f'TGM'
            else:
                if data_lis[cell_count - 2] in ('X', ""):
                    data_lis[cell_count - 2] = f'X'
            cell_count += 1

        try:
            check_day = schedule[row_no + 1][0]
        except IndexError:
            check_day = "Sun"

        if check_day != day:
            if day_index == 0:
                mon = data_lis.copy()
            elif day_index == 1:
                tue = data_lis.copy()
            elif day_index == 2:
                wed = data_lis.copy()
            elif day_index == 3:
                thu = data_lis.copy()
            elif day_index == 4:
                fri = data_lis.copy()

            day_index += 1
            data_lis = [""] * 15

    return [schedule[0][:1] + schedule[0][2:], mon, tue, wed, thu, fri]

# API endpoint to receive timetable request
@app.post("/generate-timetable/")
async def generate_timetable(
    class_name: str = Form(...),
    file: Optional[UploadFile] = File(None)
):
    if not class_name:
        raise HTTPException(status_code=400, detail="Class name is required")

    if file:
        # Save the new file as the default timetable
        with open(DEFAULT_FILE_PATH, "wb") as buffer:
            buffer.write(await file.read())
        schedule = extract_schedule(DEFAULT_FILE_PATH, class_name)
    else:
        if not os.path.exists(DEFAULT_FILE_PATH):
            raise HTTPException(status_code=400, detail="No default timetable available. Please upload a file.")
        schedule = extract_schedule(DEFAULT_FILE_PATH, class_name)

    result = process_timetable(class_name, schedule)
    return JSONResponse(content={"timetable": result})
