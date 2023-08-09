import {
  Address,
  beginCell,
  Cell,
  Contract,
  contractAddress,
  ContractProvider,
  Sender,
  SendMode, Tuple,
  TupleItem, TupleReader
} from 'ton-core';

export type Task2Config = {};

export function task2ConfigToCell(config: Task2Config): Cell {
  return beginCell().endCell();
}

export class Task2 implements Contract {
  constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {
  }

  static createFromAddress(address: Address) {
    return new Task2(address);
  }

  static createFromConfig(config: Task2Config, code: Cell, workchain = 0) {
    const data = task2ConfigToCell(config);
    const init = { code, data };
    return new Task2(contractAddress(workchain, init), init);
  }

  async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell().endCell(),
    });
  }

  async getMatrixSize(provider: ContractProvider, matrix: bigint[][]): Promise<[bigint, bigint]> {
    const matrixTuple: TupleItem[] = matrix.map((row) => ({
      type: 'tuple',
      items: row.map((value) => ({ type: 'int', value: value }))
    }));

    const result = await provider.get('get_matrix_size', [{
      type: 'tuple',
      items: matrixTuple,
    }]);
    const tuple = result.stack.readTuple();
    return [tuple.readBigNumber(), tuple.readBigNumber()];
  }

  async getMatrixMultiplier(provider: ContractProvider, matrixA: bigint[][], matrixB: bigint[][]): Promise<any> {
    const matrixATuple: TupleItem[] = matrixA.map((row) => ({
      type: 'tuple',
      items: row.map((value) => ({ type: 'int', value })),
    }));
    const matrixBTuple: TupleItem[] = matrixB.map((row) => ({
      type: 'tuple',
      items: row.map((value) => ({ type: 'int', value })),
    }));

    const result = await provider.get('matrix_multiplier', [{
      type: 'tuple',
      items: matrixATuple,
    }, {
      type: 'tuple',
      items: matrixBTuple,
    }]);

    const matrix = [];

    const matrixTuple: TupleReader = result.stack.readTuple();
    while (!!matrixTuple.remaining) {
      const rowTuple = matrixTuple.readTuple();
      const row = [];
      while (!!rowTuple.remaining) {
        row.push(rowTuple.readBigNumber());
      }
      matrix.push(row);
    }
    return matrix;
  }
}
