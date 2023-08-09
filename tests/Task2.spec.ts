import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { Cell, toNano } from 'ton-core';
import { Task2 } from '../wrappers/Task2';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

describe('Task2', () => {
  let code: Cell;

  beforeAll(async () => {
    code = await compile('Task2');
  });

  let blockchain: Blockchain;
  let task2: SandboxContract<Task2>;

  beforeEach(async () => {
    blockchain = await Blockchain.create();

    task2 = blockchain.openContract(Task2.createFromConfig({}, code));

    const deployer = await blockchain.treasury('deployer');

    const deployResult = await task2.sendDeploy(deployer.getSender(), toNano('0.05'));

    expect(deployResult.transactions).toHaveTransaction({
      from: deployer.address,
      to: task2.address,
      deploy: true,
      success: true,
    });
  });

  it('should get size of matrix', async () => {
    const sizeResult = await task2.getMatrixSize([[1n, 2n, 3n, 4n], [5n, 6n, 7n, 8n]]);
    expect(sizeResult).toEqual([2n, 4n]);
  });


  it('should multiply matrix', async () => {
    const sizeResult = await task2.getMatrixMultiplier([[1n, 2n, 3n, 4n], [5n, 6n, 7n, 8n]], [[1n, 2n], [3n, 4n], [5n, 6n], [7n, 8n]]);
    expect(sizeResult).toEqual([[50n, 60n], [114n, 140n]]);
  });
});
