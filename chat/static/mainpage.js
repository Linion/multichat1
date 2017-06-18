app = angular.module('multichat', [])
.config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.xsrfCookieName = 'csrftoken';
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
}])
.config(function($interpolateProvider) {
    $interpolateProvider.startSymbol('{$');
    $interpolateProvider.endSymbol('$}');
})
.controller('chat', function($scope, $compile){
    $scope.rooms = {}
    var ws_path = "/chat/stream/";
    console.log("Connecting to " + ws_path);
    $scope.webSocketBridge = new channels.WebSocketBridge();
    $scope.webSocketBridge.connect(ws_path);
    $scope.new_room = function(name){
        $scope.webSocketBridge.send({
            "command": "new_room",
            "title":$scope.new_room_name
        });
    }
    $scope.delete_room = function(id){
        $scope.webSocketBridge.send({
            "command": "delete_room",
            "id":id
        });
    }
    // Handle incoming messages
    $scope.webSocketBridge.listen(function(data) {
        console.log("Got websocket message", data);
        if (data.error) {
            alert(data.error);
            return;
        }
        if (data.join) {
            console.log("Joining room " + data.join);
            /*var roomdiv = $(
                `<div class='room panel-body tab-pane fade' id='room-${data.join}'>
                    <h2>${data.title}</h2>
                    <div class='messages'></div>
                    <form class='flex'><input class='messageschat'><button type='submit' class='btn btn-primary'>Отправить</button></form>
                </div>`
            )*/
            var roomdiv = 
                `<div id="room_${data.join}" class="tab-pane fade room" style="height: 100%;">
                    <div class='chat' id="room_div_${data.join}" downloadnewmessages="${data.join}">
                        <div ng-repeat="message in rooms[${data.join}].messages track by $index"
                        ng-class="message.user.id == current_user.id ? 'my-message' : 'other-user-message'"
                        ng-style="{
                            'margin-right': (message.user.id == rooms[${data.join}].messages[$index - 1].user.id && message.user.id == current_user.id) ? '60px' : '0px', 
                            'margin-left': (message.user.id == rooms[${data.join}].messages[$index - 1].user.id && message.user.id != current_user.id) ? '60px' : '0px'
                        }">
                        <button ng-if="message.user.id != rooms[${data.join}].messages[$index - 1].user.id" class="btn btn-circle btn-lg my-icon" ng-class="message.user.id == current_user.id ? 'my-icon' : 'other-user-icon'">
                            {$ message.user.first_name | limitTo:1 $}{$ message.user.last_name | limitTo:1 $}
                        </button>
                        <div class="message" ng-class="message.user.id == current_user.id ? 'my-message-content' : 'other-user-message-content'">
                                <div ng-if="message.user.id != current_user.id && message.user.id !=  rooms[${data.join}].messages[$index - 1].user.id" ng-class="message.user.id == current_user.id ? 'my-message-header' : 'other-user-message-header'" >
                                    <span class="header-by">{$ message.user.first_name $} {$ message.user.last_name $}</span> <span class="header-time">{$ message.time | date : 'MMMM d, yyyy, h:mm a': '+0' $}</span>
                                </div>
                                <div ng-if="message.user.id == current_user.id && message.user.id !=  rooms[${data.join}].messages[$index - 1].user.id" ng-class="message.user.id == current_user.id ? 'my-message-header' : 'other-user-message-header'">
                                    <span class="header-time">{$ message.time | date : 'MMMM d, yyyy, h:mm a': '+0' $}</span> <span class="header-by">Me</span>
                                </div>
                                <div class='message-content'>{$ message.message $}</div>
                            </div>
                        </div>
                    </div>
                    <div class="div-input">
                        <span class="glyphicon glyphicon-cog" style="font-size:30px; vertical-align: text-top; cursor:pointer;" data-toggle="modal" data-target="#delete_room_${data.join}"></span>
                        <input type="text" class="input-message" id="input_message" ng-model='rooms[${data.join}].message' sendmessage='${data.join}' autocomplete="off"/>
                    </div>
                </div>
                <!-- модалка удаления комнаты -->
                <div id="delete_room_${data.join}" class="modal fade" role="dialog">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <button type="button" class="close" data-dismiss="modal">&times;</button>
                                <h4 class="modal-title">Удаление комнаты</h4>
                            </div>
                            <div class="modal-body">
                                <h4 class="google-docs-link-label">${data.title}</h4>
                                <!--<input type="text" class="form-control" ng-model="new_room_name">-->
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-primary btn-raised" data-dismiss="modal" ng-click="delete_room(${data.join})">Удалить комнату</button>
                                <button type="button" class="btn btn-default" data-dismiss="modal">Отменить</button>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- модалка удаления комнаты -->`
            var e = $compile(roomdiv)($scope);
             console.log($scope.rooms[data.join].messages)
            e.find("form").on("submit", function () {
                webSocketBridge.send({
                    "command": "send",
                    "room": data.join,
                    "message": roomdiv.find("input").val()
                });
                roomdiv.find("input").val("");
                return false;
            });
            $("#chats").append(e);
            $(`#room_${roomId}`).toggleClass("in active")
            // Handle leaving
        } else if (data.leave) {
            console.log("Leaving room " + data.leave);
            $("#room-" + data.leave).remove();
            // Handle getting a message
        } else if (data.message || data.msg_type != 0) {
            var msgdiv = $("#room-" + data.room + " .messages");
            var ok_msg = "";
            switch (data.msg_type) {
                case 0:
                    $scope.rooms[data.room].messages.push(data)
                    $scope.downscrollold = $(`#room_div_${data.room}`).scrollTop() + $(`#room_div_${data.room}`).innerHeight()
                    $scope.$apply()
                    if ($scope.downscrollold >= document.getElementById(`room_div_${data.room}`).scrollHeight - 100){
                            //console.log('was on bottom')
                            $scope.$apply()
                            //$("#chat").scrollTop($("#chat")[0].scrollHeight);
                            $(`#room_div_${data.room}`).animate({scrollTop:$(`#room_div_${data.room}`)[0].scrollHeight}, 300, 'swing')
                        }
                    break;
                case 1:
                    // Warning / Advice messages
                    ok_msg = "<div class='contextual-message text-warning'>" + data.message +
                            "</div>";
                    break;
                case 2:
                    // Alert / Danger messages
                    ok_msg = "<div class='contextual-message text-danger'>" + data.message +
                            "</div>";
                    break;
                case 3:
                    // "Muted" messages
                    ok_msg = "<div class='contextual-message text-muted'>" + data.message +
                            "</div>";
                    break;
                case 4:
                    // User joined room
                    ok_msg = "<div class='contextual-message text-muted'>" + data.username +
                            " joined the room!" +
                            "</div>";
                    break;
                case 5:
                    // User left room
                    ok_msg = "<div class='contextual-message text-muted'>" + data.username +
                            " left the room!" +
                            "</div>";
                    break;
                case 6:
                    data.messages.forEach(function(message){
                        $scope.rooms[message.room].messages.unshift(message)
                    })
                    $scope.$apply()
                    $(`#room_div_${data.room}`).animate({scrollTop:$(`#room_div_${data.room}`)[0].scrollHeight}, 200, 'swing')
                    //$(`#room_${data.room}`).children()[0].animate({scrollTop:$(`#room_${data.room}`).children()[0].scrollHeight}, 200, 'swing')
                    break;
                case 7:
                    data.messages.forEach(function(message){
                        $scope.rooms[message.room].messages.unshift(message)
                    })
                    $scope.$apply()
                    $(`#room_div_${data.room}`).scrollTop(document.getElementById(`room_div_${data.room}`).scrollHeight-$scope.rooms[data.room].oldScroll)
                    break;
                case 8:
                    $scope.rooms[data.room] = {
                        "users":[],
                        "messages":[],
                        "title":data.title,
                        "id":data.room,
                    }
                    $scope.$apply()
                    break;
                case 9:
                    delete $scope.rooms[data.room]
                    $(`#room_${data.room}`).remove()
                    $scope.$apply()
                default:
                    console.log("Unsupported message type!");
                    return;
            }
            msgdiv.append(ok_msg);

            msgdiv.scrollTop(msgdiv.prop("scrollHeight"));
        } else {
            console.log("Cannot handle message!");
        }
    });
    $("li.room-link").click(function () {
        /*$scope.rooms.forEach(function(room){
            $(`#room_${room.id}`).remove("in active")
        })*/
        for (var key in $scope.rooms){
            $(`#room_${key}`).removeClass("in active")
        }
        /*$(`.room`).toggleClass("in active")*/
        roomId = $(this).attr("data-room-id");
        $(`#room_${roomId}`).toggleClass("in active")
        if (!$scope.rooms[roomId].active) {
            // Join room
            $scope.rooms[roomId].active = true
            $(this).addClass("joined");
            $scope.webSocketBridge.send({
                "command": "join",
                "room": roomId
            });
        }
        else{
            console.log('already in')
        }
    });

    // Helpful debugging
    $scope.webSocketBridge.socket.onopen = function () {
        console.log("Connected to chat socket");
    };
    $scope.webSocketBridge.socket.onclose = function () {
        console.log("Disconnected from chat socket");
    }
})
.directive('downloadnewmessages', function(){
    return{
        link:function(scope, elem, attrs){
            elem.on('scroll', function(event){
                id = attrs.downloadnewmessages
                var scrollTop = $(this).scrollTop();
                if (scrollTop + $(this).innerHeight() >= this.scrollHeight) {
                    //console.log('end')
                } else if (scrollTop <= 0) {
                    scope.rooms[id].oldScroll = document.getElementById(`room_div_${id}`).scrollHeight
                    scope.webSocketBridge.send({
                        "command": "download",
                        "room": id,
                        "time": typeof scope.rooms[id].messages[0] != 'undefined' ? scope.rooms[id].messages[0].time : null
                    });
                }
            })
        }
    }
})
.directive('sendmessage', function(){
    return{
        link:function(scope, elem, attrs){
            elem.on('keypress', function(event){
                if (event.which == '13'){
                    room = attrs.sendmessage
                    scope.webSocketBridge.send({
                            "command": "send",
                            "room": room,
                            "message": scope.rooms[room].message
                        });
                    scope.rooms[room].message = ''
                    scope.$apply()
                }
            })
        }
    }
})
.directive('getroom', function(){
    return{
        link:function(scope, elem, attrs){
            elem.on('click', function(){
                for (var key in scope.rooms){
                    $(`#room_${key}`).removeClass("active")
                }
                /*$(`.room`).toggleClass("in active")*/
                roomId = $(this).attr("data-room-id");
                $(`#room_${roomId}`).toggleClass("active")
                if (!scope.rooms[roomId].active) {
                    // Join room
                    scope.rooms[roomId].active = true
                    $(this).addClass("joined");
                    scope.webSocketBridge.send({
                        "command": "join",
                        "room": roomId
                    });
                }
                else{
                    console.log('already in')
                }
            })
        }
    }
})