import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import PropTypes from 'prop-types';
import 'bootstrap/dist/css/bootstrap.css';

function Square (props) {
  return (
    <button className={props.shouldHighlight ? 'square square-highlight' : 'square'} onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare (i) {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        shouldHighlight={this.props.winningLine && this.props.winningLine.includes(i)}
      />
    );
  }

  createTable () {
    const table = [];

    for (let i = 0; i < 3; i++) {
      const children = [];

      for (let j = 0; j < 3; j++) {
        children.push(this.renderSquare(3 * i + j));
      }

      table.push(<div className="board-row">{children}</div>);
    }

    return table;
  }

  render () {
    return (
      <div>
        {this.createTable()}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null)
      }],
      stepNumber: 0,
      xIsNext: true,
      isAscending: true
    };
  }

  handleSortingClick () {
    this.setState({
      isAscending: !this.state.isAscending
    });
  }

  handleClick (i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();

    if (calculateWinner(squares).win || squares[i]) {
      return;
    }

    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
        latestMoveSquare: i
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext
    });
  }

  jumpTo (step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0
    });
  }

  render () {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winnerResult = calculateWinner(current.squares);
    const winner = winnerResult.win;
    const winningLine = winnerResult.winningLine;

    const moves = history.map((step, move) => {
      const latestMoveSquare = step.latestMoveSquare;
      const col = latestMoveSquare % 3 + 1;
      const row = Math.floor(latestMoveSquare / 3) + 1;

      const desc = move
        ? 'Go to move #' + move + ' at {' + col + ', ' + row + '}'
        : 'Go to game start';

      return (
        <li key={move}>
          <button
            className={move === this.state.stepNumber ? 'move-list-item-selected' : ''}
            onClick={() => this.jumpTo(move)}
          >
            {desc}
          </button>
        </li>
      );
    });

    let status;
    if (winner) {
      status = 'Winner: ' + winner;
    } else if (this.state.stepNumber === 9) {
      status = 'Draw';
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    return (
      <div className="game container">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
            winningLine={winningLine}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <button onClick={() => this.handleSortingClick()}>
            {this.state.isAscending ? 'Ascending' : 'Descending'}
          </button>
          <ol>
            {this.state.isAscending ? moves : moves.slice().reverse()}
          </ol>
        </div>
      </div>
    );
  }
}

function calculateWinner (squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {
        win: squares[a],
        winningLine: lines[i]
      };
    }
  }
  return {
    win: null
  };
}

Square.propTypes = {
  value: PropTypes.any,
  onClick: PropTypes.func,
  shouldHighlight: PropTypes.bool
};

Board.propTypes = {
  squares: PropTypes.any,
  onClick: PropTypes.func,
  winningLine: PropTypes.any
};

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
