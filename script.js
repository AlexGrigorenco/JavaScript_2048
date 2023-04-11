

import { Grid } from "./grid.js"
import { Tile } from "./tile.js"

const gameBoard = document.getElementById('game-board')

let xDown = null;
let yDown = null;

const grid = new Grid(gameBoard)
grid.getRandomEmptyCell().linkTile(new Tile(gameBoard))
Math.random() > 0.5 ? grid.getRandomEmptyCell().linkTile(new Tile(gameBoard)) : null

setupTouchOnce()
setupInputOnce()

function handleTouchStart(event) {
    xDown = event.touches[0].clientX;
    yDown = event.touches[0].clientY;
    setupTouchOnce()
}

async function handleTouchMove(event) {

    addAlert()

    if (!xDown || !yDown) {
      return;
    }
  
    let xUp = event.touches[0].clientX;
    let yUp = event.touches[0].clientY;
  
    let xDiff = xDown - xUp;
    let yDiff = yDown - yUp;
  
    if (Math.abs(xDiff) > Math.abs(yDiff)) {
      if (xDiff > 0) {
        // свайп влево
        if(!canMoveLeft()){
            setupTouchOnce()
            return
        }
        await moveLeft()
        addNewTile()
      } else {
        // свайп вправо
        if(!canMoveRight()){
            setupTouchOnce()
            return
        }
        await moveRight()
        addNewTile()
      }
    } else {
    if (yDiff > 0) {
        // свайп вверх
        if(!canMoveUp()){
            setupTouchOnce()
            return
        }
        await moveUp()
        addNewTile()
      } else {
        // свайп вниз
        if(!canMoveDown()){
            setupTouchOnce()
            return
        }
        await moveDown()
        addNewTile()
      }
    }
  
    xDown = null;
    yDown = null;

    setupTouchOnce()
}



function setupTouchOnce(){
    document.addEventListener('touchstart', handleTouchStart, {once: true});
    document.addEventListener('touchmove', handleTouchMove, {once: true});
}
function setupInputOnce(){
    window.addEventListener('keydown', handleInput, {once: true})
}

function addNewTile(){
    const newTile = new Tile(gameBoard)
    grid.getRandomEmptyCell().linkTile(newTile)
}

function addAlert(){
    if(!canMoveUp() && !canMoveDown() && !canMoveLeft() && !canMoveRight()){

        if(!document.querySelector('.alert-body')){

            const alert = document.createElement('div')
            alert.classList.add('alert-body')
            alert.classList.add('reload')
            alert.innerHTML = `<div class="alert"><p>Game over!</p><p>Try again!</p><div class="reload-button reload"><img src="./images/close-bold-svgrepo-com.svg" alt="reload"></div></div>`
            gameBoard.append(alert)

            gameBoard.querySelector('.alert').addEventListener('click', e => e.stopPropagation())

            const reloads = gameBoard.querySelectorAll('.reload')
            reloads.forEach(reload => {
                reload.addEventListener('click', () => {
                    location.reload()
                })
            })
        }

        return
    }
}

async function handleInput(event){

    addAlert()
    
    switch(event.key){

        case 'ArrowUp':
            if(!canMoveUp()){
                setupInputOnce()
                return
            }
            await moveUp()
            break

        case 'ArrowDown':
            if(!canMoveDown()){
                setupInputOnce()
                return
            }
            await moveDown()
            break

        case 'ArrowLeft':
            if(!canMoveLeft()){
                setupInputOnce()
                return
            }
            await moveLeft()
            break

        case 'ArrowRight':
            if(!canMoveRight()){
                setupInputOnce()
                return
            }
            await moveRight()
            break

        default:
            setupInputOnce()
            return
    }

    addNewTile()
    // if(Math.random() > 0.5){
    //     const extraTile = new Tile(gameBoard)
    //     grid.getRandomEmptyCell().linkTile(extraTile)
    // }


    setupInputOnce()
}

async function moveUp(){
    await slideTiles(grid.cellsGroupedByColumn)
}
async function moveDown(){
    await slideTiles(grid.cellsGroupedByReversedColumn)
}
async function moveLeft(){
    await slideTiles(grid.cellsGroupedByRow)
}
async function moveRight(){
    await slideTiles(grid.cellsGroupedByReversedRow)
}

async function slideTiles(groupedCells){
    const promises = []

    groupedCells.forEach(group => slideTilesInGroup(group, promises))

    await Promise.all(promises)

    grid.cells.forEach(cell => {
        cell.hasTileForMerge() && cell.mergeTiles()
    })
}

function slideTilesInGroup(group, promises){
    for(let i = 1; i < group.length; i++){
        if(group[i].isEmpty()){
            continue
        }

        const cellWithTile = group[i]

        let targetCell
        let j = i - 1
        while(j >= 0 && group[j].canAccept(cellWithTile.linkedTile)){
            targetCell = group[j]
            j--
        }

        if(!targetCell){
            continue
        }

        promises.push(cellWithTile.linkedTile.waitForTransitionEnd())

        if(targetCell.isEmpty()){
            targetCell.linkTile(cellWithTile.linkedTile)
        }else{
            targetCell.linkTileForMerge(cellWithTile.linkedTile)
        }

        cellWithTile.unLinkTile()
    }
}

function canMoveUp(){
    return canMove(grid.cellsGroupedByColumn)
}
function canMoveDown(){
    return canMove(grid.cellsGroupedByReversedColumn)
}
function canMoveLeft(){
    return canMove(grid.cellsGroupedByRow)
}
function canMoveRight(){
    return canMove(grid.cellsGroupedByReversedRow)
}

function canMove(groupedCells){
    return groupedCells.some(group => canMoveInGroup(group))
}

function canMoveInGroup(group){
    return group.some((cell, index) => {
        if(index === 0){
            return false
        }

        if(cell.isEmpty()){
            return false
        }

        const targetCell = group[index - 1]
        return targetCell.canAccept(cell.linkedTile)
    })
}







