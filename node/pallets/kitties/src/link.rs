use frame_support::{StorageMap, Parameter};
use sp_runtime::traits::Member;
use codec::{Encode, Decode};

#[cfg_attr(feature = "std", derive(Debug, PartialEq, Eq))]
#[derive(Encode, Decode)]
pub struct LinkedItem<Value> {
	pub prev: Option<Value>,
	pub next: Option<Value>,
}

pub struct LinkedList<Storage, Key, Value>(sp_std::marker::PhantomData<(Storage, Key, Value)>);

impl<Storage, Key, Value> LinkedList<Storage, Key, Value> where
	Value: Parameter + Member + Copy,
	Key: Parameter,
	Storage: StorageMap<(Key, Option<Value>), LinkedItem<Value>, Query = Option<LinkedItem<Value>>>,
{
	fn read_head(key: &Key) -> LinkedItem<Value> {
		Self::read(key, None)
	}

	fn write_head(account: &Key, item: LinkedItem<Value>) {
		Self::write(account, None, item);
	}

	fn read(key: &Key, value: Option<Value>) -> LinkedItem<Value> {
		Storage::get((&key, value)).unwrap_or_else(|| LinkedItem {
			prev: None,
			next: None,
		})
	}

	fn write(key: &Key, value: Option<Value>, item: LinkedItem<Value>) {
		Storage::insert((&key, value), item);
	}

	pub fn append(key: &Key, value: Value) {
		// 作业
		let mut head = Self::read_head(key);
		// no element
		if head.prev.is_none() {
			Self::write_head(key,LinkedItem{ prev: Some(value), next: Some(value)});
		}else {

			let prev = head.prev;
			let mut prev_node = Self::read(key,prev);
			prev_node.next = Some(value);
			Self::write(key,prev, prev_node);

			let new_node = LinkedItem {
				prev,
				next: None,
			};
			Self::write(key,Some(value),new_node);

			head.prev = Some(value);
			Self::write_head(key,head);

		}
	}

	pub fn remove(key: &Key, value: Value) {
		// 作业
		let mut head = Self::read_head(key);

		let node = Self::read(key,Some(value));

		// last element
		match (node.prev,node.next) {
			(None,None) => {
				if head.prev.unwrap() == value {
					head.prev = None;
					head.next = None;
					Self::write_head(key,head);
				}
			},
			(None,next) => {
				// first element
				let mut next_node = Self::read(key,next);
				next_node.prev = None;
				Self::write(key,next,next_node);
				head.next = next;
				Self::write_head(key,head);
				Self::write(key,Some(value),LinkedItem{prev:None,next:None});
			},
			(prev,None) => {
				// last emelent
				let mut prev_node = Self::read(key,prev);
				prev_node.next = None;
				Self::write(key,prev,prev_node);
				head.prev = prev;
				Self::write_head(key,head);
				Self::write(key,Some(value),LinkedItem{prev:None,next:None});
			},
			(prev,next) => {
				let mut prev_node = Self::read(key,prev);
				prev_node.next = next;
				Self::write(key,prev,prev_node);

				let mut next_node = Self::read(key,next);
				next_node.prev = prev;
				Self::write(key,next,next_node);
				Self::write(key,Some(value),LinkedItem{prev:None,next:None});
			}
		}

	}
}
