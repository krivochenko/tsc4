import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { beginCell, Cell, toNano } from 'ton-core';
import { Task1 } from '../wrappers/Task1';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

describe('Task1', () => {
  let code: Cell;

  beforeAll(async () => {
    code = await compile('Task1');
  });

  let blockchain: Blockchain;
  let task1: SandboxContract<Task1>;

  beforeEach(async () => {
    blockchain = await Blockchain.create();

    task1 = blockchain.openContract(Task1.createFromConfig({}, code));

    const deployer = await blockchain.treasury('deployer');

    const deployResult = await task1.sendDeploy(deployer.getSender(), toNano('0.05'));

    expect(deployResult.transactions).toHaveTransaction({
      from: deployer.address,
      to: task1.address,
      deploy: true,
      success: true,
    });
  });

  it('should get branch by hash', async () => {
    const targetCell = beginCell().storeStringTail('Hello contest').endCell();
    const targetCellHash = 77884970875861551795056017255584758932617320976944370747942767089041742432724n;
    const tree = beginCell().storeRef(beginCell().storeUint(1000, 64).endCell()).storeRef(targetCell).endCell();
    const branchByHashResult = await task1.getBranchByHash(targetCellHash, tree);
    expect(branchByHashResult).toEqualCell(targetCell);
  });
});
