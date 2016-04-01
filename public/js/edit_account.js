function edit(id_inherit,id_none){
	document.getElementById(id_none).style.display = "none"
	document.getElementById(id_inherit).style.display = "inherit"
}

function cancel(id_inherit,id_none){
	document.getElementById(id_inherit).style.display = "inherit"
	document.getElementById(id_none).style.display = "none"
}