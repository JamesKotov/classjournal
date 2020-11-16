function ready(fn) {
    if (document.readyState !== 'loading') {
        fn();
    } else if (document.addEventListener) {
        document.addEventListener('DOMContentLoaded', fn);
    } else {
        document.attachEvent('onreadystatechange', function () {
            if (document.readyState !== 'loading')
                fn();
        });
    }
}

function addEventListener(el, eventName, handler) {
    if (el.addEventListener) {
        el.addEventListener(eventName, handler);
    } else {
        el.attachEvent('on' + eventName, function () {
            handler.call(el);
        });
    }
}

function addClass(el, className) {
    if (el.classList) {
        el.classList.add(className);
    } else {
        var current = el.className, found = false;
        var all = current.split(' ');
        for (var i = 0; i < all.length, !found; i++) found = all[i] === className;
        if (!found) {
            if (current === '') el.className = className;
            else el.className += ' ' + className;
        }
    }
}

function removeClass(el, className) {
    if (el.classList)
        el.classList.remove(className);
    else
        el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
}

function hasClass(el, className) {
    return el.classList ? el.classList.contains(className) : new RegExp('(^| )' + className + '( |$)', 'gi').test(el.className);
}

function toggleClass(el, className) {
    if (el.classList) {
        el.classList.toggle(className);
    } else {
        var classes = el.className.split(' ');
        var existingIndex = -1;
        for (var i = classes.length; i--;) {
            if (classes[i] === className)
                existingIndex = i;
        }

        if (existingIndex >= 0)
            classes.splice(existingIndex, 1);
        else
            classes.push(className);

        el.className = classes.join(' ');
    }
}

function onMarkChange(event) {
    var el = event.target;
    var name = el.getAttribute('name');
    var val = hasClass(el, "absense-mark") && !el.checked ? '' : el.value;
    return name + '=' + encodeURIComponent(val);
}

function sendPostRequest(url, data, successCb, failCb) {
    var request = new XMLHttpRequest();
    request.open('POST', url, true);
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

    request.onreadystatechange = function() {
        if (this.readyState === 4) {
            if (this.status >= 200 && this.status < 400) {
                // Success!
                if (successCb) {
                    successCb();
                }
            } else {
                if (failCb) {
                    failCb();
                }
            }
        }
    };
    request.send(data);
}

function triggerEvent(el, eventName) {
    if (document.createEvent) {
        var event = document.createEvent('HTMLEvents');
        event.initEvent(eventName, true, false);
        el.dispatchEvent(event);
    } else {
        el.fireEvent(eventName);
    }
}

ready(function() {
    var menuItems = document.querySelectorAll('#menuTabs>li');
    var tabsId = {};
    for (var i = 0; i < menuItems.length; i++) {
        tabsId['#' + menuItems[i].id] = menuItems[i];
        menuItems[i].addEventListener("click", function(){
            // occulting divs - removing .active class
            var tabs = document.querySelectorAll('.tab-content>.tab-pane');
            for (var k = 0; k < tabs.length; k++) {
                tabs[k].className = "tab-pane";
            }
            // removing .active from menu items
            for (var j = 0; j < menuItems.length; j++) {
                menuItems[j].getElementsByTagName("A")[0].className = "nav-link";
            }
            // setting .active in clicked item
            this.getElementsByTagName("A")[0].className = "nav-link active";
            // getting target id
            var linkTab = this.id;
            // showing the selected tab div
            var tab = document.querySelectorAll('.tab-content>#content_'+linkTab)[0];
            tab.className = "tab-pane active";
        });
    }

    var hash = window.location.hash;
    if (hash && Object.keys(tabsId).indexOf(hash) >= 0) {
        triggerEvent(tabsId[hash], 'click');
    }
})
