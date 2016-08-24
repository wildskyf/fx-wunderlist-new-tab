let _ = dom => document.querySelector(dom);

let updateList = listId =>
	wlAPI.http.tasks.forList(listId)
		.done( tasksDat => renderTaskList(tasksDat, listId))
		.fail( e => console.error(e.stack) );

let addTask = taskData =>
	wlAPI.http.tasks.create(taskData)
		.done( task => {
			let parser = new DOMParser();
			let newTaskDoc = parser.parseFromString(`
				<li class="task" data-task-id="${task.id}"><div>${task.title}</div></li>`, "text/html");

			_('#tasklist > ul').insertBefore(newTaskDoc.querySelector('li.task'), _('.task'));
			_('#newtask-title').value = "";
		}).fail( e => console.error(e.stack) );

let renderTaskList = (tasksDat, listId) => {
	let list_content = '';
	tasksDat.reverse().forEach( task => {
		list_content += `<li class="task" data-task-id="${task.id}"><div>${task.title}</div></li>`;
	});
	_('#tasklist > ul').innerHTML = list_content;
	_('#tasklist').dataset["listId"] = listId;
};

let renderListList = listsDat => {
	let listsSelect = _("#lists_list");

	listsDat.forEach( list => {
		listsSelect.innerHTML += `<option value="${list.id}">${list.title}</option>`;
	});

	listsSelect.addEventListener('change', () => {
		_('#tasklist > ul').innerHTML = `<li><div>Loading...</div></li>`;
		updateList(listsSelect.value);
	});
};

// ================

let initListAndMenu = () => {
	wlAPI.http.lists.all()
		.done( listsDat => {
			renderListList(listsDat);
			updateList(listsDat[0].id); // init Task List
		}).fail( e => console.error(e.stack) );
};

let initUserInfo = () => {
	wlAPI.http.user.all()
		.done(user => {
			_("#header").innerHTML = `<img src="http://a.wunderlist.com/api/v1/avatar?user_id=${user.id}" alt="user avatar" />`;
			_("#hello").innerHTML = `Hi, ${user.name}, what are you doing today?`;
		}).fail( e => console.error(e.stack) );
};

let initInputBox = () =>
	_('#newtask-title').addEventListener('keydown', event => {
		if(event.keyCode == 13) // when click enter
			addTask({
				'list_id': parseInt(_('#tasklist').dataset["listId"]),
				'title': _('#newtask-title').value
			});
	}, false);

window.onload = () => {
	wlAPI.initialized.done( () => {
		initListAndMenu();
		initUserInfo();
		initInputBox();
	});
};

