let _ = dom => document.querySelector(dom);

window.onload = () => {
	initWL.then( () => {

		let updateList = listId =>
			wlAPI.http.tasks.forList(listId)
				.done( tasksDat => renderTaskList(tasksDat, listId))
				.fail( e => console.error(e.stack) );

		let addTask = taskData =>
			wlAPI.http.tasks.create(taskData)
				.done( task => {
					let parser = new DOMParser();
					let newTask = parser.parseFromString(`
						<li class="task" data-task-id="${task.id}"><div>${task.title}</div></li>`, "text/html")
						.querySelector('li.task');

					_('#tasklist > ul').insertBefore(newTask, _('.task'));
					_('#newtask-title').value = "";

					_(`li.task[data-task-id="${task.id}"]`).addEventListener('click', e => toggleTaskDone(parseInt(e.target.parentNode.dataset.taskId)), false);
				}).fail( e => console.error(e.stack) );

		let toggleTaskDone = taskId =>
			wlAPI.http.tasks.getID(taskId)
				.done( task =>
					wlAPI.http.tasks.update(taskId, task.revision, { "completed": !task.completed })
						.done( task => _(`li[data-task-id="${task.id}"] > div`).classList.toggle('done'))
						.fail( e => console.error(e) )
				).fail( e => console.error(e) );

		let renderTaskList = (tasksDat, listId) => {
			let list_content = '';
			tasksDat.reverse().forEach( task => {
				list_content += `<li class="task" data-task-id="${task.id}"><div>${task.title}</div></li>`;
			});

			_('#tasklist > ul').innerHTML = list_content;
			_('#tasklist').dataset["listId"] = listId;

			Array.from(document.querySelectorAll('#tasklist li')).forEach( taskLi => {
				taskLi.addEventListener('click', e => toggleTaskDone(parseInt(e.target.parentNode.dataset.taskId)), false);
			});
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

		let initListAndMenu = () =>
			wlAPI.http.lists.all()
				.done( listsDat => {
					renderListList(listsDat);
					updateList(listsDat[0].id); // init Task List
				}).fail( e => console.error(e.stack) );

		let initUserInfo = () =>
			wlAPI.http.user.all()
				.done( user => {
					var avatar = document.createElement("IMG");
					avatar.src = `http://a.wunderlist.com/api/v1/avatar?user_id=${user.id}`;
					avatar.alt = `user's avatar`;
					_("#header").appendChild(avatar);

					var logout_btn = document.createElement("span");
					logout_btn.id = 'logout_btn';
					var logout_text = document.createTextNode(`logout`);
					logout_btn.appendChild(logout_text);
					_("#header").appendChild(logout_btn);

					logout_btn.addEventListener('click', event => {
						browser.runtime.getBackgroundPage().then(page => {
							page.removeToken();
							browser.tabs.getCurrent().then( tab => browser.tabs.remove( tab.id ) );
						});
					});

					var caring = document.createTextNode(`Hi, ${user.name}, what are you doing today?`);
					_("#hello").appendChild(caring);

				}).fail( e => console.error(e.stack) );

		let initInputBox = () =>
			_('#newtask-title').addEventListener('keydown', event => {
				if(event.keyCode == 13) // when click enter
					addTask({
						'list_id': parseInt(_('#tasklist').dataset["listId"]),
						'title': _('#newtask-title').value
					});
			}, false);

		let initUserConfig = () => {
			if (localStorage.setting) {
				var bgID = JSON.parse(localStorage.setting).background;
				document.querySelectorAll('html,body')
						.forEach( target => {
							target.style.backgroundImage = `url("/backgrounds/${bgID.substr(12)}.jpg")`;
						});
				// FIXME: if user change setting, this local setting won't change
			}
			else {
				wlAPI.http.settings.all()
					.done( settings => {
						setting_obj = {};
						settings.forEach( setting => {
							setting_obj[setting.key] = setting.value;
							switch (setting.key) {
								case 'background':
									document.querySelectorAll('html,body')
											.forEach( target => {
												target.style.backgroundImage = `url("/backgrounds/${setting.value.substr(12)}.jpg")`;
											});
									break;
								case 'account_locale':
									break;
								default:
									break;
							}
						});
						localStorage.setting = JSON.stringify(setting_obj);
					});
			}
		};

		wlAPI.initialized.done( () => {
			initListAndMenu();
			initUserConfig();
			initUserInfo();
			initInputBox();
		});
	});
};

