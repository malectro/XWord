var XW = (function (window, document) {


var me = {},
  XW = me,
  
  CELL_SIZE = 20,
  
  $ = document.getElementById,
  
  _grid = document.getElementById('grid')
  _case = _grid.parentNode,
  _saved = [],
  _puzz = [],
  _clues = {
    across: {},
    down: {}
  };

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
    cellEl;

  puzz.forEach(function (row, i) {
    rowEl = _.el('tr');
    
    row.forEach(function (cell, j) {
      var className;
      
      if (cell === false) {
        className = 'grid-dark';
        cell = '';
      }
      else {
        className = 'grid-light';
        cell = saved[i][j];
      }
      
      cellEl = _.el('td', {className: className, innerText: cell});
      _.data(cellEl, {y: i, x: j});
      
      rowEl.appendChild(cellEl);
    });
    
    _grid.appendChild(rowEl);
  });

  _.css(_case, {width: _grid.offsetWidth + 'px'});
  
  _puzz = puzz;
  _saved = saved;

  for (i in me) {
    if (me[i].init) {
      me[i].init();
    }
  }
};
  
me.Cursor = (function () {
  var me = {},
    _loc = {x: 0, y: 0},
    _dir,
    _el,
    _word;
    
  me.LEFT = 37;
  me.RIGHT = 39;
  me.UP = 38;
  me.DOWN = 40;
  
  _dir = me.RIGHT;
    
  me.init = function () {
    _el = _.el('div', {
      className: 'xw-cursor'
    });
    _word = _.el('div', {
      className: 'xw-word'
    });
    
    _case.appendChild(_word);
    _case.appendChild(_el);
  };

  me.move = function (to) {
    var temp;
    
    if (typeof to !== 'object') {
      temp = {x: _loc.x + 0, y: _loc.y + 0};
    
      switch (to) {
        case me.LEFT:
          temp.x--;
          break;
        
        case me.RIGHT:
          temp.x++;
          break;
          
        case me.UP:
          temp.y--;
          break;
          
        case me.DOWN:
          temp.y++;
          break;
      }
      
      to = temp;
    }
    
    if (!_puzz[to.y] || !_puzz[to.y][to.x]) {
      return;
    }
    
    _loc = to;

    me.moveCSS();
  };
  
  me.moveCSS = function () {
    _.css(_el, {
      left: (_loc.x * CELL_SIZE) + 'px',
      top: (_loc.y * CELL_SIZE) + 'px'
    });
  };
  
  
  
  return me;
}());

me.Puzzle = (function () {
  var me = {};

  me.fill = function (key) {
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
      console.log(_.data(e.target));
      XW.Cursor.move(_.data(e.target));
    }
  }
  
  function _key(e) {
    console.log('key', e.which);
    
    var key = e.which;
    
    if (key <= XW.Cursor.DOWN && key >= XW.Cursor.LEFT) {
      XW.Cursor.move(key);
    }
    else if (key === 8 || key === 32) {
      XW.Puzzle.fill('');
    }
    else if (key === 189 || (key >= 48 && key <= 57) || (key >= 65 && key <= 90)) {
      XW.Puzzle.fill(String.fromCharCode(key));
    }
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
  
  return me;
}());
  
me.init();

return me;
}(window, document));
