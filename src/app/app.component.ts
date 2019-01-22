import {Component} from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    alternatives: [number, string][] = [];
    alternativesLastIndex: number = 0;
    criterias: [number, string][] = [];
    criteriasLastIndex: number = 0;

    criteriaRelationsMatrix: number[][] = [[null]];
    alternativesRelationsMatrix: number[][][] = [];

    filledCriteriaMatrix: any[][] = [[null]];
    normalizedCriteriaMatrix: any[][] = [[null]];
    filledAlternativesMatrix: any[][][] = [];
    normalizedAlternativesMatrix: any[][][] = [];
    resoultingMatrix: any[][] = [[null]];

    calculated: boolean = false;
    detailed: boolean = false;

    winnerIndex: number = null;
    winnerPart: number = 0;

    constructor() {
        this.preloadDemo();
    }

    debugRelations() {
        console.log(JSON.stringify(this.alternativesRelationsMatrix));
    }

    addCriteria(newCriteria: string) {
        if (newCriteria) {
            this.criterias.push([++this.criteriasLastIndex, newCriteria]);

            const me = this.criteriasLastIndex;

            this.criteriaRelationsMatrix[0].push(me);
            this.criteriaRelationsMatrix.push([me]);
            this.criteriaRelationsMatrix[this.criteriaRelationsMatrix.length - 1][this.criteriaRelationsMatrix.length - 1] = 0;

            for (let i = 1; i < this.criteriaRelationsMatrix.length - 1; i++) {
                this.criteriaRelationsMatrix[this.criteriaRelationsMatrix.length - 1][i] = Math.floor(Math.random() * 16) - 8;
            }

            const newAltRelationMatrix: number[][] = [[me]];

            for (const i of this.alternatives) {
                newAltRelationMatrix[0].push(i[0]);
                newAltRelationMatrix.push([i[0]]);
                newAltRelationMatrix[newAltRelationMatrix.length - 1][newAltRelationMatrix.length - 1] = 0;

                for (let j = 1; j < newAltRelationMatrix.length - 1; j++) {
                    newAltRelationMatrix[newAltRelationMatrix.length - 1][j] = Math.floor(Math.random() * 16) - 8;
                }
            }

            const newAltRelationSheet: number[][] = [[me]];
            for (const i of this.alternatives) {
                const altIndex = i[0];

                newAltRelationSheet[0].push(altIndex);
                newAltRelationSheet.push([altIndex]);
                newAltRelationSheet[newAltRelationSheet.length - 1][newAltRelationSheet.length - 1] = 0;

                for (let j = 1; j < newAltRelationSheet.length - 1; j++) {
                    newAltRelationSheet[newAltRelationSheet.length - 1][j] = Math.floor(Math.random() * 16) - 8;
                }
            }

            this.alternativesRelationsMatrix.push(newAltRelationMatrix);

            this.debugRelations();
        }
    }

    deleteCriteria(index: number) {
        if (index >= 0) {
            for (const i of this.criterias) {
                if (i[0] === index) {
                    this.criterias.splice(this.criterias.indexOf(i), 1);
                }
            }

            const pointer = this.criteriaRelationsMatrix[0].indexOf(index);

            this.criteriaRelationsMatrix.splice(pointer, 1);

            for (const i of this.criteriaRelationsMatrix) {
                i.splice(pointer, 1);
            }

            for (const i of this.alternativesRelationsMatrix) {
                if (i[0][0] === index) {
                    this.alternativesRelationsMatrix.splice(this.alternativesRelationsMatrix.indexOf(i), 1);
                }
            }

            this.debugRelations();
        }
    }

    addAlternative(newAlternative: string) {
        if (newAlternative) {
            this.alternatives.push([++this.alternativesLastIndex, newAlternative]);

            const me = this.alternativesLastIndex;

            for (const i of this.alternativesRelationsMatrix) {
                i[0].push(me);
                i.push([me]);
                i[i.length - 1][i.length - 1] = 0;

                for (let j = 1; j < i.length - 1; j++) {
                    i[i.length - 1][j] = Math.floor(Math.random() * 16) - 8;
                }
            }
        }
    }

    deleteAlternative(index: number) {
        if (index >= 0) {
            for (const i of this.alternatives) {
                if (i[0] === index) {
                    this.alternatives.splice(this.alternatives.indexOf(i), 1);
                }
            }

            for (const i of this.alternativesRelationsMatrix) {
                const pointer = i[0].lastIndexOf(index);

                i.splice(pointer, 1);

                for (const j of i) {
                    j.splice(pointer, 1);
                }
            }

        }
    }

    getCritName(index: number | string) {
        if (index === 'СУММА') {
            return 'СУММА';
        }
        if (index === 'СРДН') {
            return 'СРДН';
        }
        if (index === 'ИТОГ') {
            return 'ИТОГ';
        }

        for (const i of this.criterias) {
            if (i[0] === index) {
                return i[1];
            }
        }

        return '\\';
    }

    getAlterName(index: number | string) {
        if (index === 'СУММА') {
            return 'СУММА';
        }
        if (index === 'СРДН') {
            return 'СРДН';
        }
        if (index === 'ИТОГ') {
            return 'ИТОГ';
        }

        for (const i of this.alternatives) {
            if (i[0] === index) {
                return i[1];
            }
        }

        return '\\';
    }

    decodeRellation(value: number): number[] {
        const relationValues: Map<number, number[]> = new Map();
        let i: number;

        for (i = -8; i < 9; i++) {
            let ratio: number = Math.abs(i) + 1;
            if (i < 0) {
                ratio = 1 / ratio;
            }
            relationValues.set(i, [1 / ratio, ratio]);
        }

        return relationValues.get(value);
    }

    calculate() {
        /*Заполняем матрицы*/
        /*Критерии*/
        let size = this.criteriaRelationsMatrix[0].length;
        let summRow = [];

        this.normalizedCriteriaMatrix = [];
        for (let i = 0; i < size; i++) {
            this.normalizedCriteriaMatrix[i] = [];
            summRow[i] = 0;
        }

        summRow[0] = 'СУММА';

        /*Заполняем и считаем сумму на лету (потому что слайдеры, ага)*/
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (i !== 0 && j !== 0) {
                    if (this.criteriaRelationsMatrix[i][j] != null) {
                        const value = this.decodeRellation(this.criteriaRelationsMatrix[i][j]);
                        this.normalizedCriteriaMatrix[i][j] = value[1];
                        this.normalizedCriteriaMatrix[j][i] = value[0];

                        summRow[i] += value[0];
                        summRow[j] += value[1];
                    }
                } else {
                    this.normalizedCriteriaMatrix[i][j] = this.criteriaRelationsMatrix[i][j];
                }
            }
        }

        this.normalizedCriteriaMatrix.push(summRow);

        /*И тут эта сволочь решает присваивать по ссылке, а не по значению! Выкручиваемся*/
        this.filledCriteriaMatrix = JSON.parse(JSON.stringify(this.normalizedCriteriaMatrix));

        /*Нормализуем*/
        for (let i = 1; i < size; i++) {
            for (let j = 1; j < size; j++) {
                this.normalizedCriteriaMatrix[i][j] = this.normalizedCriteriaMatrix[i][j] / this.normalizedCriteriaMatrix[size][j];
            }
        }

        this.normalizedCriteriaMatrix.splice(size, 1);
        this.normalizedCriteriaMatrix[0].push('СРДН');

        /*Высчитываем среднее по критерию*/
        for (let i = 1; i < size; i++) {
            let summ = 0;
            for (let j = 1; j < size; j++) {
                summ += this.normalizedCriteriaMatrix[i][j];
            }
            this.normalizedCriteriaMatrix[i].push(summ / (size - 1));
        }

        /*Варианты*/
        for (const container of this.alternativesRelationsMatrix) {
            let critIndex = container[0][0];

            this.normalizedAlternativesMatrix[critIndex] = [];
            this.filledAlternativesMatrix[critIndex] = [];

            size = container[0].length;
            summRow = [];

            for (let i = 0; i < size; i++) {
                this.normalizedAlternativesMatrix[critIndex][i] = [];
                summRow[i] = 0;
            }

            summRow[0] = 'СУММА';

            /*Заполняем и считаем сумму на лету*/
            for (let i = 0; i < size; i++) {
                for (let j = 0; j < size; j++) {
                    if (i !== 0 && j !== 0) {
                        if (container[i][j] != null) {
                            const value = this.decodeRellation(container[i][j]);
                            this.normalizedAlternativesMatrix[critIndex][i][j] = value[1];
                            this.normalizedAlternativesMatrix[critIndex][j][i] = value[0];

                            summRow[i] += value[0];
                            summRow[j] += value[1];
                        }
                    } else {
                        this.normalizedAlternativesMatrix[critIndex][i][j] =
                            container[i][j];
                    }
                }
            }

            this.normalizedAlternativesMatrix[critIndex].push(summRow);

            /*Клонируем*/
            this.filledAlternativesMatrix[critIndex] = JSON.parse(JSON.stringify(this.normalizedAlternativesMatrix[critIndex]));

            /*Нормализуем*/
            for (let i = 1; i < size; i++) {
                for (let j = 1; j < size; j++) {
                    this.normalizedAlternativesMatrix[critIndex][i][j] =
                        this.normalizedAlternativesMatrix[critIndex][i][j] / this.normalizedAlternativesMatrix[critIndex][size][j];
                }
            }

            this.normalizedAlternativesMatrix[critIndex].splice(size, 1);
            this.normalizedAlternativesMatrix[critIndex][0].push('СРДН');

            /*Высчитываем среднее по критерию*/
            for (let i = 1; i < size; i++) {
                let summ = 0;
                for (let j = 1; j < size; j++) {
                    summ += this.normalizedAlternativesMatrix[critIndex][i][j];
                }
                this.normalizedAlternativesMatrix[critIndex][i].push(summ / (size - 1));
            }
        }

        for (const i of this.criterias) {
            this.resoultingMatrix[0].push(i[0]);
        }

        for (const i of this.alternatives) {
            this.resoultingMatrix.push([i[0]]);
        }

        for (let i = 1; i < this.resoultingMatrix.length; i++) {
            for (let j = 1; j < this.resoultingMatrix[0].length; j++) {
                this.resoultingMatrix[i][j] = this.normalizedAlternativesMatrix[this.resoultingMatrix[0][j]][i][this.resoultingMatrix.length];
            }
        }

        this.resoultingMatrix[0].push('ИТОГ');

        for (let i = 1; i < this.resoultingMatrix.length; i++) {
            let resoult = 0;
            for (let j = 1; j < this.resoultingMatrix[0].length - 1; j++) {
                resoult += this.resoultingMatrix[i][j] * this.normalizedCriteriaMatrix[j][this.resoultingMatrix[0].length - 1];
            }
            this.resoultingMatrix[i].push(resoult);
        }

        for (const i of this.resoultingMatrix) {
            if (this.winnerPart <= i[i.length - 1]) {
                this.winnerIndex = i[0];
                this.winnerPart = i[i.length - 1];
            }
        }

        this.winnerPart *= 100;

        this.calculated = true;
    }

    preloadDemo() {
        const mockCrits = ['CPU', 'RAM', 'BAT', 'CAM', 'SRC'];
        const mockAlts = ['iPhone', 'Samsung', 'Sony', 'Nokia', 'Huawey', 'OnePlus'];

        for (const i of mockCrits) {
            this.addCriteria(i);
        }

        for (const i of mockAlts) {
            this.addAlternative(i);
        }
    }
}
