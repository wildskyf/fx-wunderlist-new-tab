
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

var renderTaskList = (tasksDat, listId) => {
	var list_content = '';
	tasksDat.reverse().forEach( task => {
		list_content += `<li class="task" data-task-id="${task.id}"><div>${task.title}</div></li>`;
	});
	document.querySelector('#tasklist > ul').innerHTML = list_content;
	document.querySelector('#tasklist').dataset["listId"] = listId;
};

var initTaskList = listsDat => {
	loadTasks(listsDat[0].id)
		.then( tasksDat => renderTaskList(tasksDat, listsDat[0].id) )
		.catch( e => console.error(e.stack) );
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
						renderTaskList(tasksDat, listsSelect.value);
					})
					.catch( e => console.error(e) );
			});

			initTaskList(listsDat);
	})
	.catch( (a,b,c) => console.error(a,b,c) );
};

var initUserInfo = () => {
	wlAPI.http.user.all()
		.done(user => {
			document.querySelector("#header").innerHTML = `
				<img src="http://a.wunderlist.com/api/v1/avatar?user_id=${user.id}" alt="user avatar" />`;
			document.querySelector("#hello").innerHTML = `Hi, ${user.name}, what are you doing today?`;
		})
		.fail((a,b,c) => {
			console.error(a,b,c);
		})
};

var initCreateTask = () => {
	var newtaskInput = document.querySelector('#newtask-title');
	if(newtaskInput)
		newtaskInput.addEventListener('keydown', (e) => {
			if(e.keyCode == 13) {
				var taskData = {
					'list_id': parseInt(document.querySelector('#tasklist').dataset["listId"]),
					'title': document.querySelector('#newtask-title').value
				};
				wlAPI.http.tasks.create(taskData)
					.done((task) => {
						var newtaskli = document.createElement("li");
						newtaskli.className = "task";
						newtaskli.dataset["taskId"] = task.id;
						var inNewtask = document.createElement("div");
						inNewtask.innerHTML = task.title;

						newtaskli.appendChild(inNewtask);

						document.querySelector('#tasklist > ul').insertBefore(newtaskli, document.querySelector('.task'));
						document.querySelector('#newtask-title').value = "";
					})
					.fail((a,b,c) => {
						console.error(a,b,c);
					})

			}
		}, false)
};

wlAPI.initialized.done( () => {
	initListSelect();
	initUserInfo();
});

window.onload = initCreateTask;

