function getEmployees() {
  let xhr = new XMLHttpRequest();
  xhr.open("GET", 'http://localhost:3500/api/employees');
  xhr.send();

  xhr.onerror = () => { alert(xhr.status);}
  xhr.onload = () => {
    if (xhr.status != 200) {
      alert(xhr.status);
    } else {
      let employee = JSON.parse(xhr.response).employees;
      console.log(employee)
      console.log(xhr.status)
      fillEmployees(employee);
    }
  }
}

function fillEmployees(employee) {
  console.log(employee)
  if (employee != null) {
    const templateStr = document.getElementById('employeeTemplate').innerHTML;
    let employeeTemplate = _.template(templateStr);
    let table = document.getElementById('sortTable');
    //console.log(employeeTemplate({employees: employee}))
    table.innerHTML += employeeTemplate({employees: employee.employees});
  }
}

getEmployees();