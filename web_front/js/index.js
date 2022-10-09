function getEmployees() {
    let response = await fetch("http://localhost:3500/api/employees");
    if (response.ok) {
      let json = await response.json();
    } else {
      alert("Ошибка HTTP: " + response.status);
    }

}

function fillEmployees() {
    const returnEmployees = function (employees) {
        const templateStr = document.getElementById('employeeTemplate').innerHTML;
        let employeeTemplate = _.template(templateStr);
        let table = document.getElementById("employeeTableBody");
        table.innerHTML = employeeTemplate({employees: employees});
    };
    getEmployees(returnEmployees);
}