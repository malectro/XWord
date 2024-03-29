var XW = (function (window, document) {


var me = {},
  XW = me,
  
  CELL_SIZE = 20,
  
  $ = document.getElementById,
  
  _grid = document.getElementById('grid'),
  _gridEls = [],
  _case = _grid.parentNode,
  _saved = [],
  _puzz = [],
  _clues = {},
  _clueLocs = [];

var puzz = [
  ['a', 'b', 'c'],
  ['d', 'e', 'f'],
  ['g', false, 'h']
];
var saved = [
  ['', 'c', ''],
  ['', '', ''],
  ['', '', '']
];
var clues = {
  across: [
    'clue 1',
    'clue 2',
    'clue 3',
    'clue 4'
  ],
  down: [
    'clue 5',
    'clue 6',
    'clue 7'
  ]
};

me.init = function () {
  var html = '',
    rowEl,
    cellEl,
    clueCount = 0;
    
  _clues[XW.Cursor.RIGHT] = [];
  _clues[XW.Cursor.DOWN] = [];

  puzz.forEach(function (row, i) {
    rowEl = _.el('tr');
    _gridEls[i] = [];
    _clueLocs[i] = [];
    
    row.forEach(function (cell, j) {
      //create cell
      var className,
        savedCell;
      
      if (cell === false) {
        className = 'grid-dark';
        savedCell = '';
      }
      else {
        className = 'grid-light';
        savedCell = saved[i][j];
      }
      
      cellEl = _.el('td', {className: className, innerText: savedCell});
      _.data(cellEl, {y: i, x: j});
      
      rowEl.appendChild(cellEl);
      _gridEls[i][j] = cellEl;
      
      //populate clues
      if (!puzz[i][j - 1] || !puzz[i - 1]) {
        clueCount++;
        if (!puzz[i][j - 1]) {
          _clues[XW.Cursor.RIGHT].push({
            hint: clues.across.shift(),
            x: j,
            y: i,
            num: clueCount,
            i: _clues[XW.Cursor.RIGHT].length
          });
        }
        if (!puzz[i - 1]) {
          _clues[XW.Cursor.DOWN].push({
            hint: clues.down.shift(),
            x: j,
            y: i,
            num: clueCount,
            i: _clues[XW.Cursor.DOWN].length
          });
        }
      }
      
      _clueLocs[i][j] = {};
    });
    
    _grid.appendChild(rowEl);
  });

  _.css(_case, {width: _grid.offsetWidth + 'px'});
  
  _puzz = puzz;
  _saved = saved;
  
  for (var type in _clues) {
    for (var number in _clues[type]) {
      var loc = _.copy(_clues[type][number]);
      
      while (_puzz[loc.y] && _puzz[loc.y][loc.x]) {
        _clueLocs[loc.y][loc.x][type] = _clues[type][number];
        
        if (type === '' + XW.Cursor.DOWN) {
          loc.y++;
        }
        else {
          loc.x++;
        }
      }
    }
  }

  for (i in me) {
    if (me[i].init) {
      me[i].init();
    }
  }
};
  
me.Cursor = (function () {
  var me = {},
    _loc = {x: 0, y: 0},
    _clue,
    _prevClue,
    _dir,
    _prevDir,
    _el;
    
  me.LEFT = 37;
  me.RIGHT = 39;
  me.UP = 38;
  me.DOWN = 40;
    
  me.init = function () {
    _dir = me.RIGHT;
    _clue = _clues[_dir][0];
  
    _el = _.el('div', {
      className: 'xw-cursor'
    });
    _case.appendChild(_el);
  };

  me.move = function (to, keepGoing) {
    var temp,
      dir = to,
      distance = keepGoing || 1;
    
    if (typeof to !== 'object') {
      temp = _.copy(_loc);
    
      switch (dir) {
        case me.LEFT:
          temp.x -= distance;
          _dir = me.RIGHT;
          break;
        
        case me.RIGHT:
          temp.x += distance;
          _dir = me.RIGHT;
          break;
          
        case me.UP:
          temp.y -= distance;
          _dir = me.DOWN;
          break;
          
        case me.DOWN:
          temp.y += distance;
          _dir = me.DOWN;
          break;
      }
      
      to = temp;
    }
    
    if (!_puzz[to.y] || !_puzz[to.y][to.x]) {
      if (keepGoing && to.y < _puzz.length && to.x < _puzz[0].length && to.y > 0 && to.x > 0) {
        return me.move(dir, keepGoing + 1);
      }
      
      return false;
    }
    
    _loc = to;

    //set clue
    _prevClue = _clue;
    _clue = _clueLocs[to.y][to.x][_dir];

    me.moveCSS();
    
    _prevDir = _dir;
    return true;
  };
  
  me.moveCSS = function () {
    var loc;
  
    _.css(_el, {
      left: (_loc.x * CELL_SIZE) + 'px',
      top: (_loc.y * CELL_SIZE) + 'px'
    });
    
    console.log(_prevClue, _clue);
    
    if (_prevClue === _clue) {
      return;
    }
    
    loc = _.copy(_prevClue);
    while (_puzz[loc.y] && _puzz[loc.y][loc.x]) {
      _gridEls[loc.y][loc.x].className = 'grid-light';
      if (_prevDir === me.RIGHT) {
        loc.x++;
      }
      else {
        loc.y++;
      }
    }
    
    loc = _.copy(_clue);
    while (_puzz[loc.y] && _puzz[loc.y][loc.x]) {
      _gridEls[loc.y][loc.x].className = 'grid-light on';
      if (_dir === me.RIGHT) {
        loc.x++;
      }
      else {
        loc.y++;
      }
    }
  };
  
  me.loc = function () {
    return _.copy(_loc);
  };
  
  me.prev = function () {
    if (_dir === me.RIGHT) {
      me.move(me.LEFT);
    }
    else {
      me.move(me.UP);
    }
  };
  
  me.next = function () {
    if (!me.move(_dir)) {
      me.nextClue();
    }
  };
  
  me.nextClue = function () {
    var nextClue;
    
    if (_clues[_dir][_clue.i + 1]) {
      nextClue = _clues[_dir][_clue.i + 1];
    }
    else {
      me.toggleDir();
      nextClue = _clues[_dir][0];
    }
    
    me.move(nextClue);
  };
  
  me.toggleDir = function () {
    if (_dir === me.RIGHT) {
      _dir = me.DOWN;
    }
    else {
      _dir = me.RIGHT;
    }
  };
  
  me.getDir = function () {
    return _dir;
  };
  
  return me;
}());

me.Puzzle = (function () {
  var me = {};

  me.fill = function (letter) {
    var loc = XW.Cursor.loc();
    
    letter = letter.toLowerCase();
    
    _saved[loc.y][loc.x] = letter;
    _gridEls[loc.y][loc.x].innerText = letter;
    
    if (letter) {
      XW.Cursor.next();
    }
  };

  return me;
}());

me.Controls = (function () {
  var me = {};
  
  me.init = function () {
    document.addEventListener('click', _click);
    document.addEventListener('keydown', _key);
  };
  
  function _click(e) {
    console.log(e);
    
    if (e.target.className === 'grid-light') {
      XW.Cursor.move(_.data(e.target));
      
      e.preventDefault();
    }
  }
  
  function _key(e) {
    console.log('key', e.which);
    
    var key = e.which;
    
    if (key <= XW.Cursor.DOWN && key >= XW.Cursor.LEFT) {
      XW.Cursor.move(key, 1);
    }
    else if (key === 9) {
      XW.Cursor.nextClue();
    }
    else if (key === 8 || key === 32) {
      XW.Puzzle.fill('');
      if (key === 8) {
        XW.Cursor.prev();
      }
    }
    else if (key === 189 || (key >= 48 && key <= 57) || (key >= 65 && key <= 90)) {
      XW.Puzzle.fill(String.fromCharCode(key));
    }
    
    e.preventDefault();
  }
  
  return me;
}());
  
  
var _ = me._ = (function () {
  var me = {},
    
    _ids = 1,
    _data = {};
  
  me.noop = function () {};
  
  me.el = function (tagName, options) {
    var el = document.createElement(tagName),
      ob;
      
    options = options || {};
    
    if (options.dataset) {
      ob = options.dataset;
      for (var i in ob) {
        if (ob.hasOwnProperty(i)) {
          el.dataset[i] = ob[i];
        }
      }
    }
    
    if (options.style) {
      me.css(el, options.style);
    }
    
    delete options.dataset;
    delete options.style;
    
    for (var i in options) {
      if (options.hasOwnProperty(i)) {
        el[i] = options[i];
      }
    }
    
    return el;
  };
  
  me.css = function (el, style) {
    var string = '';
  
    if (typeof style !== 'string') {
      for (var i in style) {
        if (style.hasOwnProperty(i)) {
          string += i + ':' + style[i] + ';';
        }
      }
    }
    else {
      string = style;
    }
    
    el.style.cssText += string;
  };
  
  /**
   * _.data
   * basic, memory-leak-free data getter/setter
   *
   * @param {DOMElement} el    the dom element to be associated
   * @param {object}     data  a key/value store of dat to be added (optional)
   */
  me.data = function (el, data) {
    var id = el.getAttribute('kDATA');
  
    if (!id) {
      id = _ids;
      el.setAttribute('kDATA', id);
      _data[id] = {el: el};
      _ids++;
    }
    
    if (!data) {
      return _data[id];
    }
    
    if (typeof data === 'string') {
      return _data[id][data];
    }
    
    for (var i in data) {
      if (data.hasOwnProperty(i)) {
        _data[id][i] = data[i];
      }
    }
  };
  
  /**
   * copy
   * shallow copy function for objects
   *
   * @param {object} obj  object to copy
   */
  me.copy = function (obj) {
    var clone = {};
    
    for (var i in obj) {
      clone[i] = obj[i];
    }
    
    return clone;
  };
  
  /**
   * create
   * Crockford's prototypal inheritance method
   *
   * @param {object} obj  object to extend
   */
  me.create = function (obj) {
    function F() {}
    F.prototype = obj;
    return new F();
  };
  
  return me;
}());
  
me.init();

return me;
}(window, document));
