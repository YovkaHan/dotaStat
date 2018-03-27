/**
 * Created by Jordan3D on 3/11/2018.
 */
var globalStatus = null;
function Memory() {
    var returned = {};
    var store = [];
    var memory = {
        data: {
            matchList: []
        },
        v: 0
    };

    store.push(memory);

    Object.defineProperty(
        returned,
        'init',
        {
            get: function () {
                return Object.assign({}, memory);
            },
            set: function (object) {
                if(object.hasOwnProperty('data')){
                    var version =  memory.v;
                    var rawObject = Object.assign({},object);
                    rawObject.v = ++version;
                    store.push(rawObject);
                    memory = rawObject;
                }
            }
        }
    );

    return returned;
}

document.addEventListener('DOMContentLoaded', ready);

function ready() {
    var socket = io();
    var memory = Memory();

    // var forms = document.querySelectorAll('.form');
    // forms.map = [].map;
    //
    // forms.map(function (form) {
    //     doStuff(form,'form')
    // });

    $.ajax({
        url: '/init',
        contentType : "application/json",
        method: "GET",
        success: function (data, textStatus) {
            init(data);
        },
        error: function (request, status, error) {
            console.log(request.responseText);
        }
    });

    function init(status) {
        globalStatus = status;
        process('.form');
        process('.dino');
        process('.control');
    }

    function process(selector) {
        var elems = document.querySelectorAll(selector);
        elems.map = [].map;

        elems.map(function (elem) {
            findOperation(elem,selector);
        });
    }
    function findOperation(element, selector) {
        var operations = [/(form)/, /(dino)/, /(control)/];
        operations.map(function (op) {
            if(op.test(selector)) {
                actionFunction(element, op);
            }
        });
    }
    function actionFunction(element, operation) {
        if(operation.test('form')){
            asForm(element);
        }else if(operation.test('dino')) {
            asDino(element);
        }else if(operation.test('control')){
            asControl(element)
        }
    }
    function generate(data, parentNode, sample, items) {
        items.map = [].map;
        items.map(function (i) {
            i.remove();
        });

        var sMemory = memory.init;
        data.map(function (ob, index) {
            var cpSample = sample.cloneNode(true);
            var data = {
                object : ob,
                key: index
            };
            cpSample.classList.remove('sample');
            parentNode.appendChild(matchListElement(cpSample, data));
        });

        sMemory.data.matchList = data;
        memory.init = sMemory;
    }
    function asForm(element) {
        var $element = $(element);
        var $inputs = $element.find('.form__input');
        var $startBtn = $element.find('.form__action').filter('[data-action="start"]');
        var $stopBtn = $element.find('.form__action').filter('[data-action="stop"]');

        //init
        if(globalStatus.started){
            $startBtn.toggleClass('hidden');
            $stopBtn.toggleClass('hidden');
        }

        socket.on('block-action', function(msg){
            if(msg.data.is === true) {
                $startBtn.prop('disabled', true);
            }else if(msg.data.is === false) {
                $startBtn.prop('disabled', false);
            }
        });

        $startBtn.on('click', function () {
            $startBtn.toggleClass('hidden');
            $stopBtn.toggleClass('hidden');
            var data = {};

            $.each($inputs, function (i, val) {
                var $elem = $(val);
                data[$elem.attr('id')] = $elem.val();
            });

            socket.emit('vacuum init', {
                data: data
            });
        });
        $stopBtn.on('click', function () {
            $startBtn.toggleClass('hidden');
            $stopBtn.toggleClass('hidden');
            socket.emit('vacuum stop', {});
        })

    }
    function asDino(element) {
        var $element = $(element);
        var $list = $element.find('.dino__list');
        var listItemSample = $list.find('.sample')[0];
       // var otherListItems = $list.find('.list__item').filter(':not(.sample)');
        var $moreBtn = $element.find('.dino__action').filter('[data-action="generate"]');

        $moreBtn.on('click', function () {
            socket.emit('show matches', {});
        });

        socket.on('match-list', function(data){
            var getData = data;
            generate(getData, $list[0], listItemSample, $list.find('.list__item').not('.sample'));
        });

        // function more() {
        //     var getData = null;
        //     $.ajax({
        //         url: '/api/generate',
        //         contentType : "application/json",
        //         method: "GET",
        //         success: function (data, textStatus) {
        //             getData = data;
        //             console.dir(getData);
        //             generate(getData, $list[0], listItemSample);
        //         },
        //         error: function (request, status, error) {
        //             console.log(request.responseText);
        //         }
        //     });
        // }
    }
    function asControl(element) {
        var $element = $(element);
        var $btn = $element.find('.btn');

        $btn.on('click', function () {
            var action = $(this).attr('data-action');

            if(action === 'logout'){
                $.ajax({
                    type: "POST",
                    url: 'main/logout',
                    data: JSON.stringify({}),
                    dataType: "json",
                    success: function(data, textStatus) {
                        if (data.redirect) {
                            // data.redirect contains the string URL to redirect to
                            window.location.href = data.redirect;
                        }
                    }
                })
            }else if(action === 'initiate'){
                $.ajax({
                    type: "POST",
                    url: 'main/initiate',
                    data: JSON.stringify({}),
                    dataType: "json",
                    success: function(data, textStatus) {

                    }
                })
            }
        });
    }
    function matchListElement(element, data) {
        element.setAttribute('data-key', ++data.key);
        var container = document.createElement('div');
        container.classList.add('item__content');
        container.classList.add('match-info');
        var template =
            '<div class="match-id row">' +
                 '<div class="match-id__text">Match ID</div><div class="match-id__value">'+data.object.match_id+'</div>'+
            '</div>'+
            '<div class="match-seq-num row">' +
            '<div class="match-seq-num__text">Match Seq Num</div><div class="match-seq-num__value">'+data.object.match_seq_num+'</div>'+
            '</div>'+
            '<div class="match-date row">' +
                '<div class="match-date__text">Match Date</div><div class="match-date__value">'+timeConverter(data.object.start_time)+'</div>'+
            '</div>';
        container.insertAdjacentHTML('beforeend',template);
        element.appendChild(container);
        return element;
    }
}

function timeConverter(UNIX_timestamp){
    var a = new Date(UNIX_timestamp * 1000);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = format(a.getHours());
    var min = format(a.getMinutes());
    var sec = format(a.getSeconds());
    var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
    return time;

    function format(num) {
        return num>10 ? ''+num: '0'+num;
    }
}