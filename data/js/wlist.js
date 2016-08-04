

var loadLists = () => new Promise((resolve,reject) => {
	wlAPI.http.lists.all()
		.done( (dat,statusCode) => resolve(dat, statusCode) )
		.fail( (a,b,c) => reject(a,b,c) );
});

var loadTasks = ListId => new Promise((resolve,reject) => {
	wlAPI.http.tasks.forList(ListId)
		.done( (dat,statusCode) => resolve(dat, statusCode) )
		.fail( (a,b,c) => reject(a,b,c) );
});

var renderTaskList = tasksDat => {
	var list_content = '';
	tasksDat.forEach( task => {
		list_content += `<li data-task-id="${task.id}"><div>${task.title}</div></li>`;
	})
	document.querySelector('#tasklist > ul').innerHTML = list_content;
};

var initTaskList = listsDat => {
	loadTasks(listsDat[0].id)
		.then( tasksDat => renderTaskList(tasksDat) )
		.catch( e => console.error(e) );
};

var initListSelect = () => {
	loadLists()
		.then( listsDat => {
			var listsSelect = document.querySelector("#lists_list");

			listsDat.forEach( list => {
				listsSelect.innerHTML += `<option value="${list.id}">${list.title}</option>`;
			});

			listsSelect.addEventListener('change', () => {
				document.querySelector('#tasklist > ul').innerHTML = `<li><div>Loading...</div></li>`;
				loadTasks(listsSelect.value)
					.then( tasksDat => {
						renderTaskList(tasksDat);
					})
					.catch( e => console.error(e) );
			});

			initTaskList(listsDat);
	})
	.catch( (a,b,c) => console.error(a,b,c) );
};

wlAPI.initialized.done( () => {
	initListSelect();
});

